import React from "react";
import type { Task } from "../types";
import TaskItem from "./TaskItem";

const TaskColumn: React.FC<{
  status: "Нужно Сделать" | "В процессе" | "Готово";
  tasks: Task[];
  onCreateTask: () => void;
  className?: string;
}> = ({ status, tasks, onCreateTask, className }) => {
  const statusNames = {
    "Нужно Сделать": "Нужно Сделать",
    "В процессе": "В процессе",
    Готово: "Готово",
  };

  return (
    <div className={`${className} flex flex-col mx-10 w-1/4`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">{statusNames[status]}</h3>
        <button
          onClick={onCreateTask}
          className="text-blue-500 bg-blue-50 rounded-full p-1"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {tasks.map((task) => (
          <div key={task.id} className="relative">
            <TaskItem task={task} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
