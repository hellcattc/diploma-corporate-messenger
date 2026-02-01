import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

interface Task {
  id: number;
  title: string;
  board: {
    id: number;
    name: string;
  };
}

interface TaskSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (title: string, link: string) => void;
}

const TaskSearchModal: React.FC<TaskSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
}) => {
  const { token } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Сброс состояния при закрытии
      setSearchTerm("");
      setTasks([]);
      setError(null);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    // Контроллер для отмены запроса
    const controller = new AbortController();

    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:3000/tasks/search/${searchTerm}`,
          {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(response.data);

        setTasks(response.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (axios.isCancel(err)) {
          console.log("Request canceled");
        } else {
          console.error("Failed to fetch tasks:", err);
          setError("Ошибка при загрузке задач");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timerId = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchTasks();
      } else {
        setTasks([]);
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timerId);
    };
  }, [searchTerm, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-5/6 max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Поиск задачи</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          placeholder="Искать задачи..."
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-3 text-center">{error}</div>
          ) : tasks.length === 0 && searchTerm ? (
            <p className="text-gray-500 p-3 text-center">Задачи не найдены</p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-500 p-3 text-center">
              Введите запрос для поиска задач
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => {
                  // Передаем и название, и путь
                  onSelectTask(
                    task.title,
                    `boards/${task.board.id}/task/${task.id}`
                  );
                  onClose();
                }}
              >
                <div className="font-medium truncate">{task.title}</div>
                <div className="text-sm text-gray-500 truncate">
                  Доска: {task.board.name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskSearchModal;
