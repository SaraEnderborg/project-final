import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      isAuthenticated: () => !!get().accessToken,

      setAuth: ({ user, accessToken }) =>
        set({
          user: user ?? null,
          accessToken: accessToken ?? null,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
        }),
    }),
    {
      name: "auth",
    },
  ),
);
