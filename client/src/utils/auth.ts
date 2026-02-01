import { useAuthStore } from "../store/authStore";

export const getAuthToken = (): string | null => {
  return useAuthStore.getState().token;
};
