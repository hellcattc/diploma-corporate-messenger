import { Router } from "express";
import { BoardService } from "./board.service";
import { authMiddleware } from "../../middleware/auth";

const router = Router();
const boardService = new BoardService();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const board = await boardService.createBoard(name);
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});


// Получение всех досок
router.get("/", authMiddleware, async (req, res) => {
  try {
    const boards = await boardService.getAllBoards();
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

// Получение доски по ID
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const board = await boardService.getBoardById(Number(id));
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

export default router;
