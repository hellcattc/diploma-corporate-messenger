import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Task } from "../tasks/task.entity";

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Task, (task) => task.board, {
    cascade: false,
    createForeignKeyConstraints: true,
  })
  tasks!: Task[];
}
