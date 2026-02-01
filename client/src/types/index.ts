import type { TasksStatuses } from "../store/boardStore";

export interface User {
  id: number;
  displayName: string;
  email: string;
  isAdmin?: boolean; // опционально, если нужно
}

// Доска
export interface Board {
  id: number;
  name: string;
  // Задачи обычно грузятся отдельно, но если нужна связь, можно добавить:
  // tasks?: Task[];
}

// Задача
export interface Task {
  id: number;
  title: string;
  status: TasksStatuses;
  board: Board; // ID доски, к которой принадлежит задача

  // Опциональные поля
  dueDate?: string; // ISO-строка для удобства работы с датами на клиенте
  description?: string;
  assignee?: User | null; // Ответственный (может быть null)
}
