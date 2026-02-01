/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import axios from "axios";
import { getAuthToken } from "../utils/auth";
import type { Board, Task } from "../types";

export const TASK_STATUSES = {
  "Нужно Сделать": "Нужно Сделать",
  "В процессе": "В процессе",
  Готово: "Готово",
} as const;
export type TasksStatuses = keyof typeof TASK_STATUSES;

interface BoardStore {
  boards: Board[];
  currentBoardId: number | null;
  tasks: Record<string, Task[]>;
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadBoards: () => Promise<void>;
  createBoard: (name: string) => Promise<Board>;
  selectBoard: (boardId: number) => void;
  loadTasks: (boardId: number) => Promise<void>;
  createTask: (
    title: string,
    boardID: number,
    assigneeId?: number,
    description?: string
  ) => Promise<Task>;
  updateTaskStatus: (taskId: number, newStatus: TasksStatuses) => Promise<void>;
  selectTask: (taskId: string | null) => Promise<void>;
  updateTaskAssignee: (
    taskId: number,
    assigneeId: number | null
  ) => Promise<void>;
  updateTaskDescription: (taskId: number, description: string) => Promise<void>;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  boards: [],
  currentBoardId: null,
  tasks: { "Нужно Сделать": [], "В процессе": [], Готово: [] },
  selectedTask: null,
  isLoading: false,
  error: null,

  updateTaskDescription: async (taskId, description) => {
    set({ isLoading: true });
    try {
      const token = getAuthToken();
      const response = await axios.patch<Task>(
        `http://localhost:3000/tasks/${taskId}/description`,
        { description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTask = response.data;

      set((state) => {
        const newTasks = { ...state.tasks };

        // Сохраняем существующего исполнителя
        Object.keys(newTasks).some((status) => {
          const taskIndex = newTasks[status].findIndex((t) => t.id === taskId);
          if (taskIndex !== -1) {
            updatedTask.assignee = newTasks[status][taskIndex].assignee;
            return true;
          }
          return false;
        });

        // Добавим fallback на случай, если задача не найдена
        if (!updatedTask.assignee && state.selectedTask?.id === taskId) {
          updatedTask.assignee = state.selectedTask.assignee;
        }

        // Обновляем задачи
        Object.keys(newTasks).forEach((status) => {
          newTasks[status] = newTasks[status].map((t) =>
            t.id === taskId ? updatedTask : t
          );
        });

        return {
          tasks: newTasks,
          selectedTask:
            state.selectedTask?.id === taskId
              ? { ...state.selectedTask, ...updatedTask }
              : state.selectedTask,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: "Failed to update task description", isLoading: false });
    }
  },

  updateTaskAssignee: async (taskId: number, assigneeId: number | null) => {
    set({ isLoading: true });
    try {
      const token = getAuthToken();
      const response = await axios.patch<Task>(
        `http://localhost:3000/tasks/${taskId}/assignee`,
        { assigneeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set((state) => {
        const updatedTask = response.data;
        const newTasks = { ...state.tasks };

        Object.keys(newTasks).forEach((status) => {
          newTasks[status] = newTasks[status].map((t) =>
            t.id === taskId ? updatedTask : t
          );
        });

        return {
          tasks: newTasks,
          selectedTask:
            state.selectedTask?.id === taskId
              ? updatedTask
              : state.selectedTask,
        };
      });
    } catch (error) {
      // Обработка ошибки
    } finally {
      set({ isLoading: false });
    }
  },

  loadBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      const response = await axios.get("http://localhost:3000/boards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ boards: response.data, isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      set({ error: "Failed to load boards", isLoading: false });
    }
  },

  createBoard: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      const response = await axios.post<Board>(
        "http://localhost:3000/boards",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newBoard = response.data;
      set((state) => ({
        boards: [...state.boards, newBoard],
        isLoading: false,
      }));

      return newBoard;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to create board",
        isLoading: false,
      });
      throw error;
    }
  },

  selectBoard: (boardId) => {
    set({ currentBoardId: boardId, selectedTask: null });
    get().loadTasks(boardId);
  },

  loadTasks: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `http://localhost:3000/tasks/board/${boardId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(response.data);

      // Группируем задачи по статусу
      const tasks = response.data.reduce(
        (acc: Record<string, Task[]>, task: Task) => {
          if (!acc[task.status]) acc[task.status] = [];
          acc[task.status].push(task);
          return acc;
        },
        { "Нужно Сделать": [], "В процессе": [], Готово: [] }
      );

      set({ tasks, isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      set({ error: "Failed to load tasks", isLoading: false });
    }
  },

  createTask: async (
    title: string,
    boardID: number,
    assigneeId?: number,
    description = ""
  ) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      const response = await axios.post<Task>(
        "http://localhost:3000/tasks",
        { title, boardID, assigneeId, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTask = response.data;
      set((state) => ({
        tasks: {
          ...state.tasks,
          [newTask.status]: [...state.tasks[newTask.status], newTask],
        },
        isLoading: false,
      }));

      return newTask;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.errors?.join(", ") || "Failed to create task",
        isLoading: false,
      });
      throw error;
    }
  },

  updateTaskStatus: async (taskId, newStatus) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      const response = await axios.patch(
        `http://localhost:3000/tasks/${taskId}/status`,
        { newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTask = response.data;
      console.log(updatedTask);
      set((state) => {
        // Находим текущую задачу и сохраняем её assignee
        let currentTask: Task | undefined;
        let currentStatus: string | undefined;

        // Ищем задачу во всех статусах
        for (const status of Object.keys(state.tasks)) {
          const task = state.tasks[status].find((t) => t.id === taskId);
          if (task) {
            currentTask = task;
            currentStatus = status;
            break;
          }
        }

        if (!currentStatus || !currentTask) return state;

        // Сохраняем assignee из текущей задачи
        const taskWithAssignee = {
          ...updatedTask,
          assignee: currentTask.assignee,
        };

        const tasks = { ...state.tasks };
        tasks[currentStatus] = tasks[currentStatus].filter(
          (t) => t.id !== taskId
        );
        tasks[newStatus] = [...tasks[newStatus], taskWithAssignee];

        // ОБНОВЛЯЕМ ВЫБРАННУЮ ЗАДАЧУ с сохранением assignee
        const selectedTask =
          state.selectedTask?.id === taskId
            ? taskWithAssignee
            : state.selectedTask;

        return { tasks, selectedTask, isLoading: false };
      });
    } catch (error) {
      set({ error: "Failed to update task status", isLoading: false });
    }
  },

  selectTask: async (taskId) => {
    if (!taskId) {
      set({ selectedTask: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `http://localhost:3000/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const task = response.data;
      set({ selectedTask: task, isLoading: false });
    } catch (error) {
      set({ error: "Failed to load task", isLoading: false });
    }
  },
}));
