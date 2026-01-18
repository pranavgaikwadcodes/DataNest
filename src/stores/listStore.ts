import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { List, Item, ListSchema, DeletedItem } from '../types';

interface ListStore {
    lists: List[];
    currentList: List | null;
    items: Item[];
    loading: boolean;
    deletedItem: DeletedItem | null;
    sortBy: 'created_at' | 'field';
    sortField: string | null;
    sortOrder: 'asc' | 'desc';

    // Actions
    fetchLists: () => Promise<void>;
    createList: (name: string, schema: ListSchema, color?: string, icon?: string) => Promise<void>;
    updateList: (listId: string, updates: { name?: string; schema?: ListSchema; color?: string; icon?: string }) => Promise<void>;
    deleteList: (listId: string) => Promise<void>;
    toggleFavorite: (listId: string) => Promise<void>;
    setCurrentList: (list: List | null) => void;
    fetchItems: (listId: string) => Promise<void>;
    createItem: (listId: string, data: Record<string, any>) => Promise<void>;
    updateItem: (itemId: string, data: Record<string, any>) => Promise<void>;
    deleteItem: (itemId: string) => Promise<void>;
    undoDeleteItem: () => Promise<void>;
    clearDeletedItem: () => void;
    setSortBy: (sortBy: 'created_at' | 'field', field?: string, order?: 'asc' | 'desc') => void;
    getSortedItems: () => Item[];
}

export const useListStore = create<ListStore>((set, get) => ({
    lists: [],
    currentList: null,
    items: [],
    loading: false,
    deletedItem: null,
    sortBy: 'created_at',
    sortField: null,
    sortOrder: 'desc',

    fetchLists: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('lists')
            .select('*')
            .order('is_favorite', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching lists:', error);
        } else {
            set({ lists: data || [] });
        }
        set({ loading: false });
    },

    createList: async (name: string, schema: ListSchema, color = '#3b82f6', icon = '📦') => {
        set({ loading: true });

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('No user found');
            set({ loading: false });
            return;
        }

        const { data, error } = await supabase
            .from('lists')
            .insert({ name, schema, user_id: user.id, color, icon })
            .select()
            .single();

        if (error) {
            console.error('Error creating list:', error);
        } else {
            set({ lists: [data, ...get().lists] });
        }
        set({ loading: false });
    },

    updateList: async (listId: string, updates: { name?: string; schema?: ListSchema; color?: string; icon?: string }) => {
        const { data, error } = await supabase
            .from('lists')
            .update(updates)
            .eq('id', listId)
            .select()
            .single();

        if (error) {
            console.error('Error updating list:', error);
        } else {
            set({
                lists: get().lists.map(list => list.id === listId ? data : list),
                currentList: get().currentList?.id === listId ? data : get().currentList
            });
        }
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

    toggleFavorite: async (listId: string) => {
        const list = get().lists.find(l => l.id === listId);
        if (!list) return;

        const { data, error } = await supabase
            .from('lists')
            .update({ is_favorite: !list.is_favorite })
            .eq('id', listId)
            .select()
            .single();

        if (error) {
            console.error('Error toggling favorite:', error);
        } else {
            const updatedLists = get().lists.map(l => l.id === listId ? data : l);
            // Re-sort to move favorites to top
            const sortedLists = updatedLists.sort((a, b) => {
                if (a.is_favorite && !b.is_favorite) return -1;
                if (!a.is_favorite && b.is_favorite) return 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            set({ lists: sortedLists });
        }
    },

    setCurrentList: (list: List | null) => {
        set({ currentList: list, items: [], sortBy: 'created_at', sortField: null, sortOrder: 'desc' });
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

    updateItem: async (itemId: string, data: Record<string, any>) => {
        set({ loading: true });
        const { data: updatedItem, error } = await supabase
            .from('items')
            .update({ data })
            .eq('id', itemId)
            .select()
            .single();

        if (error) {
            console.error('Error updating item:', error);
        } else {
            set({ items: get().items.map(item => item.id === itemId ? updatedItem : item) });
        }
        set({ loading: false });
    },

    deleteItem: async (itemId: string) => {
        const itemToDelete = get().items.find(item => item.id === itemId);
        if (!itemToDelete) return;

        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('Error deleting item:', error);
        } else {
            set({
                items: get().items.filter(item => item.id !== itemId),
                deletedItem: { item: itemToDelete, timestamp: Date.now() }
            });

            // Auto-clear after 5 seconds
            setTimeout(() => {
                if (get().deletedItem?.item.id === itemId) {
                    set({ deletedItem: null });
                }
            }, 5000);
        }
    },

    undoDeleteItem: async () => {
        const { deletedItem } = get();
        if (!deletedItem) return;

        set({ loading: true });
        const { data: restoredItem, error } = await supabase
            .from('items')
            .insert({
                id: deletedItem.item.id,
                list_id: deletedItem.item.list_id,
                data: deletedItem.item.data,
                created_at: deletedItem.item.created_at
            })
            .select()
            .single();

        if (error) {
            console.error('Error restoring item:', error);
        } else {
            set({
                items: [restoredItem, ...get().items],
                deletedItem: null
            });
        }
        set({ loading: false });
    },

    clearDeletedItem: () => {
        set({ deletedItem: null });
    },

    setSortBy: (sortBy: 'created_at' | 'field', field?: string, order: 'asc' | 'desc' = 'desc') => {
        set({ sortBy, sortField: field || null, sortOrder: order });
    },

    getSortedItems: () => {
        const { items, sortBy, sortField, sortOrder, currentList } = get();

        if (sortBy === 'created_at') {
            return [...items].sort((a, b) => {
                const aTime = new Date(a.created_at).getTime();
                const bTime = new Date(b.created_at).getTime();
                return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
            });
        }

        if (sortBy === 'field' && sortField && currentList) {
            return [...items].sort((a, b) => {
                const aVal = a.data[sortField];
                const bVal = b.data[sortField];

                // Handle null/undefined
                if (aVal == null && bVal == null) return 0;
                if (aVal == null) return 1;
                if (bVal == null) return -1;

                // Find field type
                const field = currentList.schema.fields.find(f => f.name === sortField);

                if (field?.type === 'number') {
                    const diff = Number(aVal) - Number(bVal);
                    return sortOrder === 'asc' ? diff : -diff;
                }

                if (field?.type === 'date') {
                    const diff = new Date(aVal).getTime() - new Date(bVal).getTime();
                    return sortOrder === 'asc' ? diff : -diff;
                }

                if (field?.type === 'boolean') {
                    const diff = (aVal ? 1 : 0) - (bVal ? 1 : 0);
                    return sortOrder === 'asc' ? diff : -diff;
                }

                // Default: text comparison
                const comparison = String(aVal).localeCompare(String(bVal));
                return sortOrder === 'asc' ? comparison : -comparison;
            });
        }

        return items;
    },
}));