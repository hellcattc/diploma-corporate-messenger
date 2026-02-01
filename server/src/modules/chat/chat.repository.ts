import { AppDataSource } from "../../config/ormconfig";
import { ChatMessage } from "./chat.entity";

export const ChatMessageRepository = AppDataSource.getRepository(ChatMessage);
