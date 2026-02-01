import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { AppDataSource } from "./config/ormconfig";
import { ChatSvc } from "./modules/chat/chat.service";
import userRouter from "./modules/user/user.controller";
import boardsRouter from "./modules/boards/board.controller";
import taskRouter from "./modules/tasks/task.controller";
import wikiRouter from "./modules/wiki/wiki.controller";
import chatRouter from "./modules/chat/chat.controller";
import cors from "cors";
import {
  socketAuthMiddleware,
  AuthenticatedSocket,
} from "./middleware/socketAuth";
import { setupSocketHandlers } from "./utils/socketHandlers";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Разрешить все источники (в продакшене укажи конкретные домены)
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;

io.use(socketAuthMiddleware);

io.on("connection", (socket: AuthenticatedSocket) => {
  console.log(`User ${socket.userID} connected`);

  // Присоединение к каналам пользователя
  socket.on("join-channel", (channelID: string) => {
    socket.join(channelID);
    console.log(`User ${socket.userID} joined channel ${channelID}`);
  });

  // Покидание канала
  socket.on("leave-channel", (channelID: string) => {
    socket.leave(channelID);
    console.log(`User ${socket.userID} left channel ${channelID}`);
  });

  // Отключение
  socket.on("disconnect", () => {
    console.log(`User ${socket.userID} disconnected`);
  });
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.use(express.json());
app.use("/users", userRouter);
app.use("/boards", boardsRouter);
app.use("/tasks", taskRouter);
app.use("/wiki", wikiRouter);
app.use("/chat", chatRouter);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export { io };
