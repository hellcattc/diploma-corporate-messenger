// store/userStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { getAuthToken } from '../utils/auth';

interface User {
  id: number;
  displayName: string;
  email: string;
}

interface UserStore {
  users: User[];
  loadUsers: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  loadUsers: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get('http://localhost:3000/chat/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ users: response.data });
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  },
}));
