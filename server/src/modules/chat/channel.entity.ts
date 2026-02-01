import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { ChatMessage } from "./chat.entity";
import { ChannelMember } from "./channelmember.entity";

@Entity()
export class Channel {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  creatorID!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => ChatMessage, (message) => message.channel)
  messages!: ChatMessage[];

  @OneToMany(() => ChannelMember, (member) => member.channel)
  members!: ChannelMember[];
}