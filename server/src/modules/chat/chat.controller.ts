import { Router } from "express";
import { ChatSvc } from "./chat.service";
import { authMiddleware, CustomRequest } from "../../middleware/auth";
import { io } from "../../server";

const router = Router();
const chatSvc = new ChatSvc();

router.post("/send", authMiddleware, async (req: CustomRequest, res) => {
  const { channelID, text } = req.body;
  const userID = req.userID;

  try {
    const message = await chatSvc.sendMessage(
      channelID,
      userID!.toString(),
      text
    );

    io.to(channelID).emit("newMessage", message);

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: (err as any).message });
  }
});

router.get("/:channelID/messages", authMiddleware, async (req, res) => {
  const { channelID } = req.params;
  const { page = 1, limit = 20 } = req.query;

  try {
    const messages = await chatSvc.getMessages(
      channelID,
      Number(page),
      Number(limit)
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: (err as any).message });
  }
});

// Новый роут: поиск сообщений
router.get("/search", authMiddleware, async (req: CustomRequest, res) => {
  const { q: query, page = 1, limit = 20 } = req.query;
  const userID = req.userID;

  try {
    const messages = await chatSvc.searchMessages(
      userID!.toString(),
      query as string,
      Number(page),
      Number(limit)
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: (err as any).message });
  }
});

// Новый роут: создание канала
router.post("/channels", authMiddleware, async (req: CustomRequest, res) => {
  const { name, memberIDs } = req.body;
  const creatorID = req.userID;

  try {
    const channel = await chatSvc.createChannel(
      name,
      creatorID!.toString(),
      memberIDs
    );
    res.json(channel);
  } catch (err) {
    res.status(500).json({ message: (err as any).message });
  }
});

// Новый роут: получение каналов пользователя
router.get("/channels", authMiddleware, async (req: CustomRequest, res) => {
  const userID = req.userID;

  try {
    const channels = await chatSvc.getUserChannels(userID!.toString());
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: (err as any).message });
  }
});

// Новый роут: получение всех пользователей
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await chatSvc.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: (err as any).message });
  }
});

export default router;
