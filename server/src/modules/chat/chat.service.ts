import { FindOptionsWhere, MoreThan, Like, In } from "typeorm";
import { AppDataSource } from "../../config/ormconfig";
import { ChatMessage } from "./chat.entity";
import { Channel } from "./channel.entity";
import { User } from "../user/user.entity";
import { ChannelMember } from "./channelmember.entity";

export class ChatSvc {
  async sendMessage(channelID: string, userID: string, text: string) {
    const user = await AppDataSource.manager.findOne(User, {
      where: { id: Number(userID) } as FindOptionsWhere<User>,
    });
    if (!user) throw new Error("User not found");

    const message = new ChatMessage();
    message.channelID = channelID;
    message.userID = userID;
    message.text = text;
    message.user = user;

    await AppDataSource.manager.save(message);
    return message;
  }

  async getMessages(channelID: string, page: number = 1, limit: number = 20) {
    return await AppDataSource.manager.find(ChatMessage, {
      where: { channelID },
      relations: ["user"],
      order: { timestamp: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async searchMessages(
    userID: string,
    query: string,
    page: number = 1,
    limit: number = 20
  ) {
    const memberChannels = await AppDataSource.manager.find(ChannelMember, {
      where: { userID },
      select: ["channelID"],
    });

    const channelIDs = memberChannels.map((m) => m.channelID);
    if (channelIDs.length === 0) return [];

    return await AppDataSource.manager.find(ChatMessage, {
      where: {
        channelID: In(channelIDs),
        text: Like(`%${query}%`),
      },
      relations: ["user"],
      order: { timestamp: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async createChannel(name: string, creatorID: string, memberIDs: string[]) {
    const channel = new Channel();
    channel.name = name;
    channel.creatorID = creatorID;
    await AppDataSource.manager.save(channel);

    // Добавляем создателя в участники
    const creatorMember = new ChannelMember();
    creatorMember.channelID = channel.id;
    creatorMember.userID = creatorID;
    creatorMember.channel = channel;
    await AppDataSource.manager.save(creatorMember);

    // Добавляем остальных участников
    for (const memberID of memberIDs) {
      if (memberID !== creatorID) {
        const member = new ChannelMember();
        member.channelID = channel.id;
        member.userID = memberID;
        member.channel = channel;
        await AppDataSource.manager.save(member);
      }
    }

    return channel;
  }

  async getUserChannels(userID: string) {
    const memberChannels = await AppDataSource.manager.find(ChannelMember, {
      where: { userID },
      relations: ["channel"],
    });

    const channelsWithMemberCount = await Promise.all(
      memberChannels.map(async (m) => {
        const memberCount = await AppDataSource.manager.count(ChannelMember, {
          where: { channelID: m.channel.id },
        });

        return {
          ...m.channel,
          memberCount,
        };
      })
    );

    return channelsWithMemberCount;
  }

  async getAllUsers() {
    return await AppDataSource.manager.find(User, {
      select: ["id", "displayName", "email"],
    });
  }
}
