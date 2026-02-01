import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TaskIcon from "../assets/icons/TaskIcon";
import ChatIcon from "../assets/icons/ChatIcon";
import WikiIcon from "../assets/icons/WikiIcon";
import { useAuthStore } from "../store/authStore";
import UserSettingsIcon from "../assets/icons/UserSettingsIcon";
// import { useChatStore } from "../store/chatStore";

const Navbar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("/chat");
  const { logout, user } = useAuthStore();

  const handleTabClick = (path: string) => {
    setActiveTab(path);
    navigate(path);
  };

  return (
    <div className="flex w-screen bg-white h-20 fixed bottom-0 z-10">
      <div className="self-center px-10 font-ubuntu">{user?.displayName}</div>
      <nav className="w-2/5 m-auto bg-white py-2 px-4 flex justify-around items-center self-center">
        <button onClick={() => handleTabClick("/chat")}>
          <ChatIcon fill={activeTab === "/chat" ? "#2b7fff" : "#E6E6E6"} />
        </button>
        <button onClick={() => handleTabClick("/boards")}>
          <TaskIcon fill={activeTab === "/boards" ? "#2b7fff" : "#E6E6E6"} />
        </button>
        <button onClick={() => handleTabClick("/wiki")}>
          <WikiIcon fill={activeTab === "/wiki" ? "#2b7fff" : "#E6E6E6"} />
        </button>
      </nav>
      <div className="self-center px-10">
        <UserSettingsIcon
          className="w-10 h-10 text-gray-600"
          onClick={() => {
            logout();
            navigate(-1);
          }}
        />
      </div>
    </div>
  );
};

export default Navbar;
