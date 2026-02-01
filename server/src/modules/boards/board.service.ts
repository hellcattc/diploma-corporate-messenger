import { AppDataSource } from "../../config/ormconfig";
import { Board } from "./board.entity";

export class BoardService {
  async createBoard(name: string) {
    const board = new Board();
    board.name = name;
    return await AppDataSource.manager.save(board);
  }

  async getAllBoards() {
    return await AppDataSource.manager.find(Board);
  }

  async getBoardById(id: number) {
    return await AppDataSource.manager.findOne(Board, {
      where: { id },
      relations: ["tasks", "tasks.assignedUser"],
    });
  }
}
