import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from
  "./context/AuthContext";

import ProtectedRoute from
  "./components/ProtectedRoute";

import LoginPage from
  "./pages/LoginPage";

import Dashboard from
  "./pages/Dashboard";

import EmployeesPage from
  "./pages/EmployeesPage";

import EmployeeDetail from
  "./pages/EmployeeDetail";


export default function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <Routes>

          <Route
            path="/login"
            element={
              <LoginPage />
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>

                <Dashboard />

              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute>

                <EmployeesPage />

              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/:id"
            element={
              <ProtectedRoute>

                <EmployeeDetail />

              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
              />
            }
          />

        </Routes>

      </BrowserRouter>

    </AuthProvider>
  );
}
