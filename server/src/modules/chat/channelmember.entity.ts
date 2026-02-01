import { Channel } from "./channel.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../user/user.entity";

@Entity()
export class ChannelMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  channelID!: string;

  @Column()
  userID!: string;

  @CreateDateColumn()
  joinedAt!: Date;

  @ManyToOne(() => Channel, (channel) => channel.members)
  @JoinColumn({ name: "channelID" })
  channel!: Channel;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userID" })
  user!: User;
}