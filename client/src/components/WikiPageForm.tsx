import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useWikiStore } from "../store/wikiStore";
import TaskSearchModal from "../components/TaskSearchModal";

const WikiPageForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const {
    currentPage,
    getPage,
    createPage,
    updatePage,
    resetCurrentPage,
    loading,
  } = useWikiStore();

  // Состояние для модального окна поиска задач
  const [isTaskSearchModalOpen, setIsTaskSearchModalOpen] = useState(false);
  const [pendingTaskInsert, setPendingTaskInsert] = useState(false);

  // Определяем режим формы: создание (new) или редактирование
  // ИСПРАВЛЕНО: используем useLocation для правильного определения
  const isCreating = location.pathname === "/wiki/new";

  // ОТЛАДКА - удалите после исправления
  console.log("DEBUG: id =", id, "typeof id =", typeof id);
  console.log("DEBUG: location.pathname =", location.pathname);
  console.log("DEBUG: isCreating =", isCreating);

  useEffect(() => {
    if (isCreating) {
      // Режим создания: сбрасываем все поля И очищаем currentPage
      resetCurrentPage();
      setTitle("");
      setContent("");
      setCategory("");
    } else if (id) {
      // Режим редактирования: загружаем страницу
      getPage(Number(id));
    }
  }, [location.pathname, id, getPage, resetCurrentPage, isCreating]);

  // При получении данных страницы заполняем форму (только для редактирования)
  useEffect(() => {
    if (currentPage && !isCreating) {
      setTitle(currentPage.title);
      setContent(currentPage.content);
      setCategory(currentPage.category || "");
    }
  }, [currentPage, isCreating]);

  // Обработчик изменения содержимого с поддержкой поиска задач
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);

    // Активация поиска при вводе [[
    if (!pendingTaskInsert && text.endsWith("[[")) {
      setIsTaskSearchModalOpen(true);
      setPendingTaskInsert(true);
    } else if (!text.includes("[[")) {
      setPendingTaskInsert(false);
    }
  };

  // Обработчик выбора задачи
  const handleSelectTaskLink = (title: string, path: string) => {
    setContent((prev) => prev.replace(/\[\[$/, `[[${title}|${path}]]`));
    setPendingTaskInsert(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreating) {
      // Режим создания: создаем новую страницу
      await createPage(title, content, category);
      navigate("/wiki");
    } else if (currentPage) {
      // Режим редактирования: обновляем существующую
      await updatePage(currentPage.id, content);
      navigate(`/wiki/${currentPage.id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="text-lg">Загрузка...</div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">
        {isCreating ? "Создать страницу" : "Редактировать страницу"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Заголовок</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={!isCreating}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Категория (опционально)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={!isCreating}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            Содержимое
            <span className="text-sm text-gray-500 ml-2">
              (используйте [[ для поиска и вставки ссылок на задачи)
            </span>
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[300px]"
            value={content}
            onChange={handleContentChange}
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg"
            onClick={() => navigate("/wiki")}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {isCreating ? "Создать" : "Сохранить"}
          </button>
        </div>
      </form>

      {/* Модальное окно поиска задач */}
      <TaskSearchModal
        isOpen={isTaskSearchModalOpen}
        onClose={() => setIsTaskSearchModalOpen(false)}
        onSelectTask={handleSelectTaskLink}
      />
    </div>
  );
};

export default WikiPageForm;
