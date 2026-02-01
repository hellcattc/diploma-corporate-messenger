import { Server } from "socket.io";
import {
  socketAuthMiddleware,
  AuthenticatedSocket,
} from "../middleware/socketAuth";
import { ChatSvc } from "../modules/chat/chat.service";

const chatSvc = new ChatSvc();

export const setupSocketHandlers = (io: Server) => {
  // Применяем middleware для аутентификации
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userID} connected with socket ${socket.id}`);

    // Пользователь присоединяется к каналу
    socket.on("joinChannel", async (channelID: string) => {
      try {
        // Проверяем, что пользователь имеет доступ к каналу
        const userChannels = await chatSvc.getUserChannels(
          socket.userID!.toString()
        );
        const hasAccess = userChannels.some((ch) => ch.id === channelID);

        if (hasAccess) {
          socket.join(channelID);
          console.log(`User ${socket.userID} joined channel ${channelID}`);

          // Отправляем последние сообщения канала
          const messages = await chatSvc.getMessages(channelID, 1, 50);
          socket.emit("channelMessages", messages.reverse());
        } else {
          socket.emit("error", { message: "No access to this channel" });
        }
      } catch (error) {
        console.error("Join channel error:", error);
        socket.emit("error", { message: "Failed to join channel" });
      }
    });

    // Отправка сообщения (альтернативный способ через WebSocket)
    socket.on(
      "newMessage",
      async (messageData: { channelID: string; text: string }) => {
        try {
          const message = await chatSvc.sendMessage(
            messageData.channelID,
            socket.userID!.toString(),
            messageData.text
          );

          // Отправляем сообщение всем участникам канала
          io.to(messageData.channelID).emit("message", message);
          console.log(
            `Message sent to channel ${messageData.channelID}:`,
            message
          );
        } catch (error) {
          console.error("Send message error:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // Получение каналов пользователя
    socket.on("getUserChannels", async () => {
      try {
        const channels = await chatSvc.getUserChannels(
          socket.userID!.toString()
        );
        // Теперь channels уже содержат memberCount после обновления сервиса
        socket.emit("userChannels", channels);

        // Также отправляем через событие "channel" для совместимости с существующим кодом
        socket.emit("channel", channels);
      } catch (error) {
        console.error("Get channels error:", error);
        socket.emit("error", { message: "Failed to get channels" });
      }
    });
  });
};
