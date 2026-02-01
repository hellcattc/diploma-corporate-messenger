import { RequestHandler, Router } from "express";
import { TaskService } from "./task.service";
import { authMiddleware } from "../../middleware/auth";
import { CreateTaskDto } from "./dto/create-task.dto";
import { validateDto } from "../../middleware/validation-middleware";
import { io } from "../../server";

const router = Router();
const taskService = new TaskService();

router.get("/board/:boardID", authMiddleware, async (req, res) => {
  const { boardID } = req.params;

  try {
    const tasks = await taskService.getTasksByBoard(Number(boardID));
    res.json(tasks);
  } catch (error) {
    console.error("Failed to get tasks:", error);
    res.status(500).json({ error: "Failed to get tasks" });
  }
});

router.patch("/:taskID/description", authMiddleware, async (req, res) => {
  const { taskID } = req.params;
  const { description } = req.body;

  const task = await taskService.updateTaskDescription(
    Number(taskID),
    description
  );

  // Перезагружаем задачу со связями
  const fullTask = await taskService.getTaskById(Number(taskID));

  if (fullTask!.board) {
    io.to(`board-${fullTask!.board.id}`).emit("taskUpdated", fullTask);
  }
  res.json(fullTask);
});

// Добавляем роут для получения задачи по ID
router.get("/:taskID", authMiddleware, async (req, res) => {
  const { taskID } = req.params;
  const task = await taskService.getTaskById(Number(taskID));

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  // Форматируем дату
  const response = {
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
  };

  res.json(response);
});

router.patch("/:taskID/assignee", authMiddleware, async (req, res) => {
  const { taskID } = req.params;
  const { assigneeId } = req.body;

  const task = await taskService.updateTaskAssignee(Number(taskID), assigneeId);
  console.log(task);
  res.json(task);
});

// Обновляем роут для смены статуса
router.patch("/:taskID/status", authMiddleware, async (req, res) => {
  const { taskID } = req.params;
  const { newStatus } = req.body;
  const task = await taskService.updateTaskStatus(Number(taskID), newStatus);

  res.json(task);
});

// В task.controller.ts добавить новый роут
router.get("/search/:query", authMiddleware, async (req, res) => {
  const { query } = req.params;

  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "Invalid search query" }).send();
    return;
  }

  try {
    const tasks = await taskService.searchTasks(query);
    res.json(tasks);
    return;
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, boardID, assigneeId, description } = req.body;

    const task = await taskService.createTask(
      title,
      boardID,
      assigneeId,
      description
    );

    // Отправим событие всем подключенным к доске
    io.to(`board-${boardID}`).emit("taskCreated", task);

    console.log(task);

    res.status(201).json(task);
  } catch (error) {
    console.error("Failed to create task:", error);

    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
