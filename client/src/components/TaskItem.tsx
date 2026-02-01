import React from "react";
import type { Task } from "../types";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-3 transition-all hover:shadow-md">
      <Link to={`/boards/${task.board.id}/task/${task.id}`}>
        <div className="flex justify-between">
          <h4 className="font-medium text-gray-800">{task.title}</h4>
          <span
            className={`text-xs px-2 py-1 rounded-full text-center ${
              task.status === "Нужно Сделать"
                ? "bg-blue-100 text-blue-800"
                : task.status === "В процессе"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {task.status}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center">
            {task.assignee && (
              <span className="text-xs text-gray-500 inline-flex items-center">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs mr-1">
                  {task.assignee.displayName.charAt(0)}
                </div>
                {task.assignee.displayName}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500">
            {format(new Date(task.dueDate!), "d MMM")}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default TaskItem;
