import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Analytics from "./pages/Analytics";
import AuditLogs from "./pages/AuditLogs";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Upload from "./pages/Upload";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/upload" element={<AdminRoute><Upload /></AdminRoute>} />
      <Route path="/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
      <Route path="/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}
