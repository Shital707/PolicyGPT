import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const token = useAuth((s) => s.token);
  const role = useAuth((s) => s.role);
  if (!token) return <Navigate to="/login" replace />;
  const isAdmin = role === "super_admin" || role === "hr_admin";
  if (!isAdmin) return <Navigate to="/chat" replace />;
  return children;
}
