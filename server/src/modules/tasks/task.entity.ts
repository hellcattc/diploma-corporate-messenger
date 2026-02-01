import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Board } from "../boards/board.entity";
import { User } from "../user/user.entity";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: "Новая задача" }) // Добавляем значение по умолчанию
  title!: string;

  @Column({ default: "Нужно Сделать" })
  status!: "Нужно Сделать" | "В процессе" | "Готово";

  @CreateDateColumn()
  dueDate!: Date;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Board, (board) => board.tasks, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "boardId" })
  board!: Board;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "assigneeId" })
  assignee?: User | null;
}
