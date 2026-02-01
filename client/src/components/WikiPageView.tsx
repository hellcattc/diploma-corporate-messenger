import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWikiStore } from "../store/wikiStore";
import renderLinkifiedText from "../utils/renderLinkifiedText";

interface WikiPageViewProps {
  page: {
    id: number;
    title: string;
    content: string;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

const WikiPageView: React.FC<WikiPageViewProps> = ({ page }) => {
  const navigate = useNavigate();
  const { deletePage } = useWikiStore();

  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить эту страницу?")) {
      await deletePage(page.id);
      navigate("/wiki");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 my-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{page.title}</h1>
        <div className="flex gap-2">
          <Link
            to={`/wiki/${page.id}/edit`}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Редактировать
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </div>

      {page.category && (
        <span className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full mb-4">
          Категория: {page.category}
        </span>
      )}

      <div className="mt-4 text-gray-700 whitespace-pre-line border-t pt-4">
        {renderLinkifiedText(page.content, { unlink: false })}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>Создано: {new Date(page.createdAt).toLocaleString()}</p>
        <p>Последнее обновление: {new Date(page.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default WikiPageView;
