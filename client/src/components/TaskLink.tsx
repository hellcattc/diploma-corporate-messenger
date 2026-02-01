import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  status: "Нужно Сделать" | "В процессе" | "Готово";
  description?: string;
  dueDate: string;
  assignee?: {
    id: number;
    displayName: string;
  } | null;
}

interface TaskLinkProps {
  title: string;
  url: string;
}

const TaskLink: React.FC<TaskLinkProps> = ({ title, url }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const taskId = parseInt(url.split("/").pop() || "", 10);

  const { token } = useAuthStore();

  useEffect(() => {
    if (!showPreview || isNaN(taskId)) return;

    let isMounted = true;
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:3000/tasks/${taskId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (isMounted) {
          setTask(response.data);
        }
      } catch (error) {
        console.error("Failed to load task:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchTask, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [showPreview, taskId]);

  return (
    <span className="relative inline-block">
      <Link
        to={"/" + url}
        target="_blank"
        // onClick={() => {
        //   navigate(url, { replace: true, relative:  });
        // }}
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        #{title}
      </Link>

      {showPreview && (
        <div className="absolute z-50 top-full mt-1 left-0 w-72 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-xl">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : task ? (
            <div className="p-4">
              <div className="flex justify-between">
                <h4 className="font-medium text-gray-800 truncate">
                  {task.title}
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
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
                  {task.dueDate &&
                    new Date(task.dueDate).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-gray-500">Задача не найдена</div>
          )}
        </div>
      )}
    </span>
  );
};

export default TaskLink;
