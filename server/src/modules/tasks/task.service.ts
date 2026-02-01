import { TaskRepository } from "./task.repository";
import { Task } from "./task.entity";
import { Board } from "../boards/board.entity";
import { User } from "../user/user.entity";
import { AppDataSource } from "../../config/ormconfig";
import { UserRepository } from "../user/user.repository";

export class TaskService {
  async createTask(
    title: string,
    boardID: number,
    assigneeId?: number,
    description?: string
  ) {
    // Загружаем настоящие сущности
    const board = await AppDataSource.manager.findOne(Board, {
      where: { id: boardID },
    });

    if (!board) {
      throw new Error("Board not found");
    }

    const task = new Task();
    task.title = title;
    task.board = board;
    task.description = description;

    if (assigneeId) {
      const user = await AppDataSource.manager.findOne(User, {
        where: { id: assigneeId },
      });

      if (user) {
        task.assignee = user;
      }
    }

    return await TaskRepository.save(task);
  }

  // Добавим метод для получения задач по ID
  async getTaskById(taskID: number) {
    return await TaskRepository.findOne({
      where: { id: taskID },
      relations: ["board", "assignee"],
    });
  }

  async updateTaskStatus(
    taskID: number,
    newStatus: "Нужно Сделать" | "В процессе" | "Готово"
  ) {
    const task = await TaskRepository.findOne({
      where: { id: taskID },
      relations: ["board"],
    });
    if (!task) throw new Error("Task not found");

    task.status = newStatus;
    await TaskRepository.save(task);
    return task;
  }

  async getTasksByBoard(boardID: number) {
    return await TaskRepository.find({
      where: { board: { id: boardID } },
      relations: ["board", "assignee"], // Добавляем relations для связи
    });
  }

  async deleteTask(taskID: number) {
    await TaskRepository.delete(taskID);
  }

  async updateTaskDescription(id: number, description: string): Promise<Task> {
    const task = await TaskRepository.findOne({
      where: { id },
      relations: ["board"],
    });
    if (!task) throw new Error("Task not found");

    task.description = description;
    return TaskRepository.save(task);
  }

  async updateTaskAssignee(
    id: number,
    assigneeId: number | null
  ): Promise<Task> {
    const task = await TaskRepository.findOne({
      where: { id },
      relations: ["assignee", "board"], // Загрузка текущих отношений
    });
    if (!task) throw new Error("Task not found");

    if (assigneeId === null) {
      task.assignee = null;
    } else {
      const assignee = await UserRepository.findOneBy({ id: assigneeId });
      if (!assignee) throw new Error("User not found");
      task.assignee = assignee;
    }
    const saved = await TaskRepository.save(task);
    return saved;
  }

  async searchTasks(query: string): Promise<Task[]> {
    return TaskRepository.createQueryBuilder("task")
      .leftJoinAndSelect("task.board", "board")
      .where("task.title LIKE :query", { query: `%${query}%` })
      .orWhere("task.description LIKE :query", { query: `%${query}%` })
      .take(10)
      .getMany();
  }
}
