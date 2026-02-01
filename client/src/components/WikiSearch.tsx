import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWikiStore } from '../store/wikiStore';

const WikiSearch: React.FC = () => {
  const [localQuery, setLocalQuery] = useState('');
  const { searchPages, pages, searchQuery, loading } = useWikiStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPages(localQuery);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSearch} className="flex mb-4">
        <input
          type="text"
          placeholder="Поиск по вики..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
        >
          Найти
        </button>
      </form>

      <Link to="/wiki/new">
        <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 mb-4">
          Создать новую страницу
        </button>
      </Link>

      {loading && <div className="text-center py-4">Загрузка...</div>}

      {pages.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Результаты поиска "{searchQuery}":</h3>
          <ul className="divide-y divide-gray-200">
            {pages.map(page => (
              <li key={page.id} className="py-3">
                <Link 
                  to={`/wiki/${page.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {page.title}
                </Link>
                {page.category && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{page.category}</span>}
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{page.content}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && pages.length === 0 && searchQuery && (
        <div className="text-center py-4 text-gray-500">
          Страницы не найдены
        </div>
      )}
    </div>
  );
};

export default WikiSearch;