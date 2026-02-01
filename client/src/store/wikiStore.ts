/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// store/wikiStore.ts
import { create } from "zustand";
import axios from "axios";
import { getAuthToken } from "../utils/auth";

interface WikiPage {
  id: number;
  title: string;
  content: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WikiState {
  pages: WikiPage[];
  currentPage: WikiPage | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;

  searchPages: (query: string) => Promise<void>;
  getPage: (id: number) => Promise<void>;
  createPage: (
    title: string,
    content: string,
    category?: string
  ) => Promise<void>;
  updatePage: (id: number, content: string) => Promise<void>;
  deletePage: (id: number) => Promise<void>;
  resetCurrentPage: () => void;
}

export const useWikiStore = create<WikiState>((set) => ({
  pages: [],
  currentPage: null,
  searchQuery: "",
  loading: false,
  error: null,

  searchPages: async (query) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `http://localhost:3000/wiki/search?query=${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Конвертируем строковые даты в Date объекты
      const pages = response.data.map((page: any) => ({
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt),
      }));

      set({ pages, searchQuery: query, loading: false });
    } catch (error) {
      set({ error: "Failed to search pages", loading: false });
    }
  },

  getPage: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();
      const response = await axios.get(`http://localhost:3000/wiki/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Конвертируем строковые даты в Date объекты
      const currentPage = {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };

      set({ currentPage, loading: false });
    } catch (error) {
      set({ error: "Failed to load page", loading: false });
    }
  },

  createPage: async (title, content, category) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();
      const response = await axios.post(
        "http://localhost:3000/wiki/",
        { title, content, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Конвертируем строковые даты в Date объекты
      const newPage = {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };

      set((state) => ({
        pages: [...state.pages, newPage],
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create page", loading: false });
    }
  },

  updatePage: async (id, content) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();
      const response = await axios.patch(
        `http://localhost:3000/wiki/${id}`,
        { newContent: content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Конвертируем строковые даты в Date объекты
      const updatedPage = {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };

      set((state) => ({
        currentPage: updatedPage,
        pages: state.pages.map((page) => (page.id === id ? updatedPage : page)),
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update page", loading: false });
    }
  },

  deletePage: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();
      await axios.delete(`http://localhost:3000/wiki/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        pages: state.pages.filter((page) => page.id !== id),
        currentPage: state.currentPage?.id === id ? null : state.currentPage,
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete page", loading: false });
    }
  },

  resetCurrentPage: () => set({ currentPage: null }),
}));
