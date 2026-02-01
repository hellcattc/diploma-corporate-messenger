import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useBoardStore } from "../store/boardStore";
import { CreateBoardModal } from "../components/CreateBoardModal";

const BoardsPage: React.FC = () => {
  const { boardId, taskId } = useParams<{
    boardId?: string;
    taskId?: string;
  }>();
  const navigate = useNavigate();
  const { boards, loadBoards, createBoard, selectBoard, selectTask } =
    useBoardStore();

  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (boardId) {
      selectBoard(Number(boardId));
    }
  }, [boardId]);

  useEffect(() => {
    if (taskId) {
      selectTask(taskId);
    } else {
      selectTask(null);
    }
  }, [taskId]);

  const handleCreateBoard = async (name: string) => {
    const board = await createBoard(name);
    navigate(`/boards/${board.id}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Левая панель с досками в стиле чат-интерфейса */}
      <div className="w-72 bg-white shadow-sm flex flex-col h-full justify-start">
        <div className="p-4 border-b border-gray-200 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Доски</h2>
        </div>

        <div className="overflow-y-auto py-2 flex-col justify-start w-full overflow-hidden">
          {boards.map((board) => (
            <Link
              key={board.id}
              to={`/boards/${board.id}`}
              className={`mx-2 mb-1 p-3 rounded-lg flex items-center cursor-pointer transition-all w-full ${
                String(boardId) === String(board.id)
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3 bg-blue-500">
                {board.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {board.name}
                </h3>
                <p className="text-xs text-gray-500">Задачи</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => setIsCreateBoardModalOpen(true)}
            className="w-full flex items-center justify-center py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            <span className="text-sm font-medium">Новая доска</span>
          </button>
        </div>
      </div>

      {/* Основная область */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* Модальное окно создания доски */}
      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => setIsCreateBoardModalOpen(false)}
        onSubmit={handleCreateBoard}
      />
    </div>
  );
};

export default BoardsPage;
