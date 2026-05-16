import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import SchoolDetails from "./pages/SchoolDetails";
import ReviewSystem from "./pages/ReviewSystem";
import Rankings from "./pages/Rankings";
import Reports from "./pages/Reports";
import TeacherPortal from "./pages/TeacherPortal";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "teacher") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/school/:id"
            element={
              <Layout>
                <SchoolDetails />
              </Layout>
            }
          />
          <Route
            path="/review/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReviewSystem />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rankings"
            element={
              <Layout>
                <Rankings />
              </Layout>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-portal"
            element={
              <TeacherRoute>
                <Layout>
                  <TeacherPortal />
                </Layout>
              </TeacherRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
