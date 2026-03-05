import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      isAuthenticated: () => !!get().accessToken,

      setAuth: (payload) =>
        set({
          user: payload
            ? {
                email: payload.email ?? null,
                userId: payload.userId ?? null,
              }
            : null,
          accessToken: payload?.accessToken ?? null,
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
