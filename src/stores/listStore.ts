import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { List, Item, ListSchema } from '../types';

interface ListStore {
    lists: List[];
    currentList: List | null;
    items: Item[];
    loading: boolean;

    // Actions
    fetchLists: () => Promise<void>;
    createList: (name: string, schema: ListSchema) => Promise<void>;
    deleteList: (listId: string) => Promise<void>;  // NEW
    setCurrentList: (list: List | null) => void;
    fetchItems: (listId: string) => Promise<void>;
    createItem: (listId: string, data: Record<string, any>) => Promise<void>;
    deleteItem: (itemId: string) => Promise<void>;
}

export const useListStore = create<ListStore>((set, get) => ({
    lists: [],
    currentList: null,
    items: [],
    loading: false,

    fetchLists: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('lists')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching lists:', error);
        } else {
            set({ lists: data || [] });
        }
        set({ loading: false });
    },

    createList: async (name: string, schema: ListSchema) => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('lists')
            .insert({ name, schema })
            .select()
            .single();

        if (error) {
            console.error('Error creating list:', error);
        } else {
            set({ lists: [data, ...get().lists] });
        }
        set({ loading: false });
    },

    deleteList: async (listId: string) => {
        const { error } = await supabase
            .from('lists')
            .delete()
            .eq('id', listId);

        if (error) {
            console.error('Error deleting list:', error);
        } else {
            set({ lists: get().lists.filter(list => list.id !== listId) });
        }
    },

    setCurrentList: (list: List | null) => {
        set({ currentList: list, items: [] });
    },

    fetchItems: async (listId: string) => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('list_id', listId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching items:', error);
        } else {
            set({ items: data || [] });
        }
        set({ loading: false });
    },

    createItem: async (listId: string, data: Record<string, any>) => {
        set({ loading: true });
        const { data: newItem, error } = await supabase
            .from('items')
            .insert({ list_id: listId, data })
            .select()
            .single();

        if (error) {
            console.error('Error creating item:', error);
        } else {
            set({ items: [newItem, ...get().items] });
        }
        set({ loading: false });
    },

    deleteItem: async (itemId: string) => {
        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('Error deleting item:', error);
        } else {
            set({ items: get().items.filter(item => item.id !== itemId) });
        }
    },
}));