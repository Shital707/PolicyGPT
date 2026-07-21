import { create } from "zustand";

type AuthState = {
  token: string | null;
  role: string | null;
  setAuth: (token: string, role: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: sessionStorage.getItem("pg_token"),
  role: sessionStorage.getItem("pg_role"),
  setAuth: (token, role) => {
    sessionStorage.setItem("pg_token", token);
    sessionStorage.setItem("pg_role", role);
    set({ token, role });
  },
  logout: () => {
    sessionStorage.removeItem("pg_token");
    sessionStorage.removeItem("pg_role");
    set({ token: null, role: null });
  },
}));
