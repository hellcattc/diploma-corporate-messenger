import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./pages/PrivateRoute";
import Navbar from "./components/Navbar"; // Импортируем навбар
import BoardsPage from "./pages/BoardsPage";
import BoardPage from "./pages/BoardPage";
import WikiPageForm from "./components/WikiPageForm";
import WikiHome from "./pages/WikiHome";
import WikiPage from "./pages/WikiPage";

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="App font-ubuntu">
        {/* Показываем навбар только для авторизованных пользователей */}
        {isAuthenticated && <Navbar />}

        <Routes>
          {/* Публичные маршруты */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/chat" replace /> : <LoginPage />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/chat" replace />
              ) : (
                <RegisterPage />
              )
            }
          />
          {/* Защищенные маршруты */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/boards"
            element={
              <ProtectedRoute>
                <BoardsPage />
              </ProtectedRoute>
            }
          >
            <Route path=":boardId" element={<BoardPage />} />
            <Route path=":boardId/task/:taskId" element={<BoardPage />} />
          </Route>

          {/* Wiki routes */}
          <Route
            path="/wiki"
            element={
              <ProtectedRoute>
                <WikiHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wiki/new"
            element={
              <ProtectedRoute>
                <WikiPageForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wiki/:id/edit"
            element={
              <ProtectedRoute>
                <WikiPageForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wiki/:id"
            element={
              <ProtectedRoute>
                <WikiPage />
              </ProtectedRoute>
            }
          />

          {/* Остальные маршруты... */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/chat" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<div>Страница не найдена</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
