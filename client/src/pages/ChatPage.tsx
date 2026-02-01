import React, { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { SearchModal } from "../components/SearchModal";
import { CreateChannelModal } from "../components/CreateChannelModal";
import TaskSearchModal from "../components/TaskSearchModal";
import renderLinkifiedText from "../utils/renderLinkifiedText";

const ChatPage = () => {
  const [messageText, setMessageText] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isTaskSearchModalOpen, setIsTaskSearchModalOpen] = useState(false);
  const [pendingTaskInsert, setPendingTaskInsert] = useState(false);

  // Изменить обработчик изменения текста сообщения
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setMessageText(text);

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
    setMessageText((prev) => prev.replace(/\[\[$/, `[[${title}|${path}]]`));
    setPendingTaskInsert(false);
  };

  const {
    messages,
    currentChannel,
    channels,
    sendMessage,
    joinChannel,
    connect,
    loadUserChannels,
  } = useChatStore();

  const { user } = useAuthStore();

  useEffect(() => {
    connect();
    loadUserChannels();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && currentChannel) {
      sendMessage(messageText);
      setMessageText("");
    }
  };

  const handleChannelSelect = (channelId: string) => {
    joinChannel(channelId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Compact Sidebar */}
      <div className="w-72 bg-white shadow-sm flex flex-col justify-start align-">
        {/* Search Bar */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Искать в сообщениях..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              onClick={() => setIsSearchOpen(true)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Channels List */}
        <div className="flex overflow-y-auto w-full">
          <div className="py-2 w-full">
            {channels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelSelect(channel.id)}
                className={`mx-2 mb-1 p-3 cursor-pointer transition-all ${
                  currentChannel === channel.id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center mb-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3 bg-blue-500`}
                  >
                    {channel.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {channel.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {channel.memberCount || 0} участников
                    </p>
                  </div>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[18px] text-center">
                      {channel.unreadCount}
                    </span>
                  )}
                </div>
                {channel.lastMessage && (
                  <p className="text-xs text-gray-600 truncate pl-13">
                    {renderLinkifiedText(channel.lastMessage, {
                      unlink: true,
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Chat Button */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setIsCreateChannelOpen(true)}
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
            <span className="text-sm font-medium">Добавить чат</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {currentChannel ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-col items-center justify-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {channels.find((ch) => ch.id === currentChannel)?.name ||
                      "Чат"}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {channels.find((ch) => ch.id === currentChannel)
                      ?.memberCount || 0}{" "}
                    участников
                  </span>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
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
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-blue-50 w-full flex ">
              {messages.length === 0 ? (
                <div className="text-center m-auto max-w-fit">
                  <p className="text-gray-500 mb-2">Пока нет сообщений</p>
                  <p className="text-sm text-gray-400">
                    Начните общение, отправив первое сообщение
                  </p>
                </div>
              ) : (
                <div className="space-y-4 w-full mx-auto pb-10">
                  {messages.map((message, index) => {
                    const isOwn = message.userID === user?.id?.toString();
                    const showAvatar =
                      !isOwn &&
                      (index === 0 ||
                        messages[index - 1].userID !== message.userID);

                    return (
                      <div
                        key={message.id}
                        className={`flex pb-2  ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex max-w-lg ${
                            isOwn ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {!isOwn && (
                            <div className="flex-shrink-0 mr-3">
                              {showAvatar ? (
                                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-sm text-white font-medium">
                                  {message.user?.displayName?.charAt(0) || "U"}
                                </div>
                              ) : (
                                <div className="w-8 h-8"></div>
                              )}
                            </div>
                          )}

                          <div className={`relative ${isOwn ? "mr-3" : ""}`}>
                            {!isOwn && showAvatar && (
                              <div className="text-xs font-medium text-gray-600 mb-1 ml-1">
                                {message.user?.displayName || "Unknown"}
                              </div>
                            )}

                            <div
                              className={`relative px-4 py-3 rounded-2xl ${
                                isOwn
                                  ? "bg-blue-500 text-white rounded-br-md"
                                  : "bg-white text-gray-900 rounded-bl-md shadow-sm"
                              }`}
                            >
                              <div className="text-sm leading-relaxed">
                                {renderLinkifiedText(message.text, {
                                  unlink: false,
                                })}
                              </div>

                              <div
                                className={`text-xs mt-1 ${
                                  isOwn ? "text-blue-100" : "text-gray-400"
                                }`}
                              >
                                {new Date(message.timestamp).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-100 pb-20">
              <form
                onSubmit={handleSendMessage}
                className="w-full mx-auto outline-none focus:outline-none hover:outline-none"
              >
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageText}
                      onChange={handleTextChange} // Обновленный обработчик
                      placeholder="Сообщение..."
                      className="w-full px-18 py-3 bg-blue-50 outline-none focus:outline-none hover:outline-none resize-none"
                    />
                  </div>
                </div>
              </form>
            </div>
          </>
        ) : (
          /* No Channel Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Выберите чат для начала общения
              </h2>
              <p className="text-gray-500 mb-6">
                Выберите чат из списка слева или создайте новый
              </p>
              <button
                onClick={() => setIsCreateChannelOpen(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
              >
                Создать новый чат
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />
      <TaskSearchModal
        isOpen={isTaskSearchModalOpen}
        onClose={() => setIsTaskSearchModalOpen(false)}
        onSelectTask={handleSelectTaskLink}
      />
    </div>
  );
};

export default ChatPage;
