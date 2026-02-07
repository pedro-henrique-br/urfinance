import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getSession,
} from "@/api/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init: async () => {
    const { data } = await getSession();
    set({
      user: data.session?.user ?? null,
      loading: false,
    });
  },

  signIn: async (email, password) => {
    const result = await signInWithEmail(email, password);

    if (result.error) {
      return result;
    }

    const user = result.data?.user;

    if (user && !user.email_confirmed_at) {
      await signOut();

      set({ user: null });

      return {
        error: {
          message: "Email nao confirmado",
        },
      };
    }

    set({ user });

    return result;
  },

  signUp: async (email, password, fullName) => {
    return signUpWithEmail(email, password, fullName);
  },

  logout: async () => {
    await signOut();
    set({ user: null });
  },
}));
