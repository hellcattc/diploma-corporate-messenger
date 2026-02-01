/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useBoardStore, type TasksStatuses } from "../store/boardStore";
import type { Task, User } from "../types";
import { useNavigate } from "react-router-dom";

const TaskModal: React.FC<{ task: Task; users: User[] }> = ({
  task,
  users,
}) => {
  const {
    updateTaskStatus,
    selectTask,
    updateTaskAssignee,
    updateTaskDescription,
  } = useBoardStore();
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setEditedTask(task);
  }, [task, task.id]);

  const handleAssigneeChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const assigneeId = e.target.value ? parseInt(e.target.value) : null;
    setIsUpdating(true);
    try {
      setEditedTask((prev) => ({
        ...prev,
        assignee: users.find((u) => u.id === assigneeId) || null,
      }));
      await updateTaskAssignee(editedTask.id, assigneeId);
    } catch (error) {
      console.error("Failed to update assignee:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: TasksStatuses) => {
    setIsUpdating(true);
    try {
      await updateTaskStatus(task.id, newStatus);
      setEditedTask((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDescriptionChange = async () => {
    if (editedTask.description !== task.description) {
      setIsUpdating(true);
      try {
        await updateTaskDescription(
          editedTask.id,
          editedTask.description || ""
        );
      } catch (error) {
        console.error("Failed to update description:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleClose = () => {
    selectTask(null);
    navigate(-1);
  };

  const getStatusColor = (status: TasksStatuses) => {
    switch (status) {
      case "Нужно Сделать":
        return "bg-red-100 text-red-800";
      case "В процессе":
        return "bg-yellow-100 text-yellow-800";
      case "Готово":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">
        {/* Заголовок */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Детали задачи
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Название задачи */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название
            </label>
            <div className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">
              {editedTask.title}
            </div>
          </div>

          {/* Статус и исполнитель */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <div className="relative">
                <select
                  value={editedTask.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  disabled={isUpdating}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                >
                  <option value="Нужно Сделать">Нужно Сделать</option>
                  <option value="В процессе">В процессе</option>
                  <option value="Готово">Готово</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    editedTask.status
                  )}`}
                >
                  {editedTask.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Назначено
              </label>
              <div className="relative">
                <select
                  value={editedTask.assignee?.id || ""}
                  onChange={handleAssigneeChange}
                  disabled={isUpdating}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                >
                  <option value="">Не назначено</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {editedTask.assignee && (
                <div className="mt-2 flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-medium text-white mr-2">
                    {editedTask.assignee.displayName.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {editedTask.assignee.displayName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={editedTask.description || ""}
              onChange={(e) =>
                setEditedTask((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              onBlur={handleDescriptionChange}
              disabled={isUpdating}
              placeholder="Добавьте описание задачи..."
              className="w-full h-32 px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Дата создания */}
          {editedTask.dueDate && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Создано:{" "}
                {new Date(editedTask.dueDate).toLocaleDateString("ru-RU")}
              </div>
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Закрыть
          </button>
          {isUpdating && (
            <div className="flex items-center text-sm text-blue-600">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Сохранение...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
