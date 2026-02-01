/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useBoardStore } from "../store/boardStore";
import TaskColumn from "../components/TaskColumn";
import TaskModal from "../components/TaskModal";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { useUserStore } from "../store/userStore";
import type { TasksStatuses } from "../store/boardStore";

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const {
    tasks,
    isLoading,
    createTask,
    updateTaskStatus,
    selectedTask,
    loadTasks,
  } = useBoardStore();
  const { users, loadUsers } = useUserStore();

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [currentTaskStatus, setCurrentTaskStatus] =
    useState<TasksStatuses>("Нужно Сделать");

  useEffect(() => {
    if (boardId) loadTasks(Number(boardId));
  }, [boardId]);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateTask = (status: TasksStatuses) => {
    setCurrentTaskStatus(status);
    setIsCreateTaskModalOpen(true);
  };

  const handleSubmitTask = async (title: string, description: string) => {
    if (boardId) {
      const task = await createTask(
        title,
        Number(boardId),
        undefined,
        description
      );
      if (task) {
        // Обновляем статус только что созданной задачи
        await updateTaskStatus(task.id, currentTaskStatus);
      }
    }
  };

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="p-4">
      <div className="flex gap-4 justify-between">
        {(["Нужно Сделать", "В процессе", "Готово"] as const).map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks[status]}
            onCreateTask={() => handleCreateTask(status)}
          />
        ))}
      </div>

      {selectedTask && <TaskModal task={selectedTask} users={users} />}

      {/* Модальное окно создания задачи */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSubmit={handleSubmitTask}
        status={currentTaskStatus}
      />
    </div>
  );
};

export default BoardPage;
