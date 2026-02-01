// pages/WikiPage.tsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import WikiPageView from "../components/WikiPageView";
import { useWikiStore } from "../store/wikiStore";

const WikiPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentPage, getPage, resetCurrentPage } = useWikiStore();

  useEffect(() => {
    if (id) getPage(Number(id));

    return () => resetCurrentPage();
  }, [id]);

  if (!currentPage) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 mb-20">
      <WikiPageView page={currentPage} />
    </div>
  );
};

export default WikiPage;
