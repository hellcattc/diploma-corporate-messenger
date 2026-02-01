import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ChatMessage } from "../chat/chat.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string; 

  @Column()
  displayName!: string;

  @Column({ default: false })
  isAdmin!: boolean;

  @OneToMany(() => ChatMessage, (message) => message.user)
  messages!: ChatMessage[];
}


