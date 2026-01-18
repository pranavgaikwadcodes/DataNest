import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthStore {
    user: User | null;
    loading: boolean;
    initialized: boolean;

    signUp: (email: string, password: string) => Promise<{ error: string | null }>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: false,
    initialized: false,

    initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        set({
            user: session?.user ? { id: session.user.id, email: session.user.email! } : null,
            initialized: true
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({
                user: session?.user ? { id: session.user.id, email: session.user.email! } : null
            });
        });
    },

    signUp: async (email: string, password: string) => {
        set({ loading: true });
        const { error } = await supabase.auth.signUp({ email, password });
        set({ loading: false });

        if (error) {
            return { error: error.message };
        }
        return { error: null };
    },

    signIn: async (email: string, password: string) => {
        set({ loading: true });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        set({ loading: false });

        if (error) {
            return { error: error.message };
        }
        return { error: null };
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null });
    },
}));