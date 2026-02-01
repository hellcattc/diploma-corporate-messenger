// pages/WikiHome.tsx
import React from "react";
import WikiSearch from "../components/WikiSearch";

const WikiHome: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 mb-20">
      <WikiSearch />
    </div>
  );
};

export default WikiHome;
