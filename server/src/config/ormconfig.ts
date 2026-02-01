import { DataSource } from "typeorm";
import { User } from "../modules/user/user.entity";
import { Task } from "../modules/tasks/task.entity";
import { Board } from "../modules/boards/board.entity";
import { WikiPage } from "../modules/wiki/wiki.entity";
import { ChatMessage } from "../modules/chat/chat.entity";
import { Channel } from "../modules/chat/channel.entity";
import { ChannelMember } from "../modules/chat/channelmember.entity";

export const AppDataSource = new DataSource({
  type: "sqlite", // Тип базы данных
  database: "database.sqlite", // Имя файла базы данных
  entities: [User, Task, Board, WikiPage, ChatMessage, Channel, ChannelMember], // Список сущностей
  synchronize: true, // Автоматически создает таблицы (только для разработки!)
  logging: true, // Логи запросов для отладки
});
