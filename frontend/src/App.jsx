
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import CreatePollPage from "./pages/CreatePollPage";
import MyPollsPage from "./pages/MyPollsPage";
import SinglePollPage from "./pages/SinglePollPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SharePollPage from "./pages/SharePollPage";
import UserProfilePage from "./pages/UserProfilePage";
import SettingsPage from "./pages/SettingsPage";
import VotedPollsPage from "./pages/VotedPollsPage";
import BookmarkedPollsPage from "./pages/BookmarkedPollsPage";
import NotFoundPage from "./pages/NotFoundPage";
import VotersPage from "./pages/VotersPage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Home() {
  const token = localStorage.getItem("token");

  return (
    <Navigate
      to={token ? "/dashboard" : "/login"}
      replace
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-poll"
          element={
            <ProtectedRoute>
              <CreatePollPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-polls"
          element={
            <ProtectedRoute>
              <MyPollsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/poll/:id"
          element={
            <ProtectedRoute>
              <SinglePollPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/poll/:id/voters"
          element={
            <ProtectedRoute>
              <VotersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics/:id"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/share/:id"
          element={
            <ProtectedRoute>
              <SharePollPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voted-polls"
          element={
            <ProtectedRoute>
              <VotedPollsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookmarked-polls"
          element={
            <ProtectedRoute>
              <BookmarkedPollsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

