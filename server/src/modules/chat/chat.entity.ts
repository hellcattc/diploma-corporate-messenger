import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../user/user.entity";
import { Channel } from "./channel.entity";

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  channelID!: string;

  @Column()
  userID!: string;

  @Column()
  text!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: "userID" })
  user!: User;

  @ManyToOne(() => Channel, (channel) => channel.messages)
  @JoinColumn({ name: "channelID" })
  channel!: Channel;
}