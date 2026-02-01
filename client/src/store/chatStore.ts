import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useAuthStore, type User } from "./authStore"; // Импортируем auth store
import { getAuthToken } from "../utils/auth";

interface Message {
  id: string;
  channelID: string;
  userID: string;
  text: string;
  timestamp: Date;
  user?: {
    id: string;
    displayName: string;
  };
}

interface ChatStore {
  messages: Message[];
  searchResults: Message[];
  currentChannel: string;
  channels: {
    id: string;
    name: string;
    lastMessage?: string;
    unreadCount?: number;
    memberCount?: number;
  }[];
  connectedUser: User | null;
  socket: Socket | null;
  availableUsers: User[];
  connect: () => void;
  sendMessage: (text: string) => void;
  joinChannel: (channelID: string) => void;
  addUser: (user: User) => void;
  addMessage: (message: Message) => void;
  addChannel: (channel: { id: string; name: string }) => void;
  searchMessages: (query: string) => Promise<void>;
  createChannel: (name: string, memberIDs: string[]) => Promise<void>;
  loadUserChannels: () => Promise<void>;
  loadAvailableUsers: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  searchResults: [],
  currentChannel: "",
  channels: [],
  connectedUser: null,
  socket: null,
  availableUsers: [],

  // Замени метод connect в chatStore.ts

  connect: () => {
    const token = getAuthToken();
    const user = useAuthStore.getState().user;

    console.log("Connecting with token:", token ? "exists" : "missing");
    console.log("User:", user);

    if (!token || !user) {
      console.log("No token or user, cannot connect");
      return;
    }

    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
      auth: {
        token: token, // Передаем токен в auth
      },
      query: {
        userId: user.id.toString(), // Используем реального пользователя
      },
    });

    socket.on("connect", () => {
      console.log("Connected to chat server");
      set({ socket, connectedUser: user }); // Устанавливаем connectedUser!
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    socket.on("message", (msg: Message) => {
      console.log("Received message:", msg);
      const currentUser = useAuthStore.getState().user;

      set((state) => ({
        messages: [...state.messages, msg],
        channels: state.channels.map((channel) => {
          if (channel.id === msg.channelID) {
            // Увеличиваем счетчик только если:
            // 1. Сообщение не от текущего пользователя
            // 2. Канал не активный в данный момент
            const shouldIncrement =
              msg.userID !== currentUser?.id?.toString() &&
              state.currentChannel !== msg.channelID;

            return {
              ...channel,
              lastMessage: msg.text,
              unreadCount: shouldIncrement
                ? (channel.unreadCount || 0) + 1
                : channel.unreadCount || 0,
            };
          }
          return channel;
        }),
      }));
    });

    socket.on("channel", (channels: { id: string; name: string }[]) => {
      console.log("Received channels:", channels);
      set({ channels });
    });

    socket.on("user", (user: User) => {
      console.log("Received user:", user);
      set({ connectedUser: user });
    });

    return () => {
      socket.disconnect();
    };
  },

  // Замени метод sendMessage в твоем chatStore.ts

  sendMessage: (text: string) => {
    const state = get();
    if (!state.connectedUser || !state.currentChannel || !state.socket) {
      console.log("Missing requirements for sending message");
      return;
    }

    console.log("Sending message via WebSocket:", text);

    // Отправляем через WebSocket
    state.socket.emit("newMessage", {
      channelID: state.currentChannel,
      text: text,
    });

    // Сообщение будет получено обратно через обработчик "message"
    // и автоматически добавлено в стейт
  },

  joinChannel: (channelID: string) => {
    console.log("Joining channel:", channelID);

    set((state) => ({
      currentChannel: channelID,
      messages: [], // Очищаем сообщения перед загрузкой новых
      // Сбрасываем счетчик непрочитанных для выбранного канала
      channels: state.channels.map((channel) =>
        channel.id === channelID ? { ...channel, unreadCount: 0 } : channel
      ),
    }));

    const state = get();
    if (state.socket) {
      state.socket.emit("joinChannel", channelID);

      // Добавляем обработчик для получения сообщений канала
      state.socket.on("channelMessages", (messages: Message[]) => {
        console.log("Received channel messages:", messages);
        set({ messages });
      });
    }
  },

  addUser: (user: User) => {
    set({ connectedUser: user });
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
      channels: state.channels.map((channel) =>
        channel.id === message.channelID
          ? {
              ...channel,
              lastMessage: message.text,
              unreadCount: (channel.unreadCount || 0) + 1,
            }
          : channel
      ),
    }));
  },

  addChannel: (channel: { id: string; name: string }) => {
    set((state) => ({
      channels: [...state.channels, { ...channel, unreadCount: 0 }],
    }));
  },

  // Исправленный метод: поиск сообщений
  searchMessages: async (query: string) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `http://localhost:3000/chat/search?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      set({ searchResults: response.data });
    } catch (error) {
      console.error("Search failed:", error);
      set({ searchResults: [] });
    }
  },

  // Исправленный метод: создание канала
  createChannel: async (name: string, memberIDs: string[]) => {
    try {
      const token = getAuthToken();
      await axios.post(
        "http://localhost:3000/chat/channels",
        {
          name,
          memberIDs,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await get().loadUserChannels();
    } catch (error) {
      console.error("Create channel failed:", error);
      throw error;
    }
  },

  // Исправленный метод: загрузка каналов пользователя
  loadUserChannels: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get("http://localhost:3000/chat/channels", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        channels: response.data.map((ch: any) => ({ ...ch, unreadCount: 0 })),
      });
    } catch (error) {
      console.error("Load channels failed:", error);
    }
  },

  // Исправленный метод: загрузка доступных пользователей
  loadAvailableUsers: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get("http://localhost:3000/chat/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ availableUsers: response.data });
    } catch (error) {
      console.error("Load users failed:", error);
    }
  },
}));
