// utils/axios.ts
import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Создаем экземпляр axios
const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
});

// Interceptor для добавления токена к каждому запросу
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ответов и ошибок авторизации
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Если получили 401 ошибку, разлогиниваем пользователя
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      // Перенаправляем на страницу логина
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
