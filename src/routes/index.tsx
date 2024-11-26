import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Upload from '../pages/Upload';
import Watch from '../pages/Watch';
import Profile from '../pages/Profile';
import Live from '../pages/Live';
import Chat from '../pages/Chat';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/watch/:id" element={<Watch />} />
      <Route
        path="/upload"
        element={
          <PrivateRoute>
            <Upload />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/live"
        element={
          <PrivateRoute>
            <Live />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat/:roomId"
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}