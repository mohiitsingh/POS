import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

// --- Types ---
export interface Category {
    id: string;
    name: string;
    isActive: boolean;
}

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    categoryId: string;
    isActive: boolean;
    description?: string;
    isVeg?: boolean;
}

interface MenuContextType {
    categories: Category[];
    menuItems: MenuItem[];
    loading: boolean;
    error: string | null;
    addCategory: (name: string) => Promise<void>;
    updateCategory: (id: string, name: string) => Promise<void>;
    toggleCategoryStatus: (id: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<boolean>;
    addMenuItem: (item: Omit<MenuItem, 'id' | 'isActive'>) => Promise<void>;
    updateMenuItem: (id: string, item: Partial<Omit<MenuItem, 'id' | 'isActive'>>) => Promise<void>;
    deleteMenuItem: (id: string) => Promise<void>;
    toggleMenuItemStatus: (id: string) => Promise<void>;
}

// --- Context ---
const MenuContext = createContext<MenuContextType | undefined>(undefined);

// --- Provider ---
export const MenuProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch categories from Supabase
    const fetchCategories = async () => {
        if (!user) {
            setCategories([]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            const mappedCategories: Category[] = (data || []).map(cat => ({
                id: cat.id,
                name: cat.name,
                isActive: cat.is_active
            }));

            setCategories(mappedCategories);
        } catch (err: any) {
            console.error('Error fetching categories:', err);
            setError(err.message);
        }
    };

    // Fetch menu items from Supabase
    const fetchMenuItems = async () => {
        if (!user) {
            setMenuItems([]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            const mappedItems: MenuItem[] = (data || []).map(item => ({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price),
                categoryId: item.category_id,
                isActive: item.is_active,
                description: item.description,
                isVeg: item.is_veg
            }));

            setMenuItems(mappedItems);
        } catch (err: any) {
            console.error('Error fetching menu items:', err);
            setError(err.message);
        }
    };

    // Load data when user changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            await Promise.all([fetchCategories(), fetchMenuItems()]);
            setLoading(false);
        };

        loadData();
    }, [user]);

    // --- Actions ---

    // Categories
    const addCategory = async (name: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{ name, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;

            const newCategory: Category = {
                id: data.id,
                name: data.name,
                isActive: data.is_active
            };

            setCategories(prev => [...prev, newCategory]);
        } catch (err: any) {
            console.error('Error adding category:', err);
            throw err;
        }
    };

    const updateCategory = async (id: string, name: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { error } = await supabase
                .from('categories')
                .update({ name })
                .eq('id', id);

            if (error) throw error;

            setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name } : cat));
        } catch (err: any) {
            console.error('Error updating category:', err);
            throw err;
        }
    };

    const toggleCategoryStatus = async (id: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const category = categories.find(c => c.id === id);
            if (!category) return;

            const { error } = await supabase
                .from('categories')
                .update({ is_active: !category.isActive })
                .eq('id', id);

            if (error) throw error;

            setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, isActive: !cat.isActive } : cat));
        } catch (err: any) {
            console.error('Error toggling category status:', err);
            throw err;
        }
    };

    const deleteCategory = async (id: string): Promise<boolean> => {
        if (!user) throw new Error('User not authenticated');

        // Check if category has items
        const hasItems = menuItems.some(item => item.categoryId === id);
        if (hasItems) {
            return false; // Block deletion
        }

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setCategories(prev => prev.filter(cat => cat.id !== id));
            return true;
        } catch (err: any) {
            console.error('Error deleting category:', err);
            throw err;
        }
    };

    // Menu Items
    const addMenuItem = async (item: Omit<MenuItem, 'id' | 'isActive'>) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { data, error } = await supabase
                .from('menu_items')
                .insert([{
                    user_id: user.id,
                    category_id: item.categoryId,
                    name: item.name,
                    price: item.price,
                    description: item.description,
                    is_veg: item.isVeg
                }])
                .select()
                .single();

            if (error) throw error;

            const newItem: MenuItem = {
                id: data.id,
                name: data.name,
                price: parseFloat(data.price),
                categoryId: data.category_id,
                isActive: data.is_active,
                description: data.description,
                isVeg: data.is_veg
            };

            setMenuItems(prev => [...prev, newItem]);
        } catch (err: any) {
            console.error('Error adding menu item:', err);
            throw err;
        }
    };

    const updateMenuItem = async (id: string, updates: Partial<Omit<MenuItem, 'id' | 'isActive'>>) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.price !== undefined) dbUpdates.price = updates.price;
            if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
            if (updates.description !== undefined) dbUpdates.description = updates.description;
            if (updates.isVeg !== undefined) dbUpdates.is_veg = updates.isVeg;

            const { error } = await supabase
                .from('menu_items')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
        } catch (err: any) {
            console.error('Error updating menu item:', err);
            throw err;
        }
    };

    const deleteMenuItem = async (id: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMenuItems(prev => prev.filter(item => item.id !== id));
        } catch (err: any) {
            console.error('Error deleting menu item:', err);
            throw err;
        }
    };

    const toggleMenuItemStatus = async (id: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const item = menuItems.find(i => i.id === id);
            if (!item) return;

            const { error } = await supabase
                .from('menu_items')
                .update({ is_active: !item.isActive })
                .eq('id', id);

            if (error) throw error;

            setMenuItems(prev => prev.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
        } catch (err: any) {
            console.error('Error toggling menu item status:', err);
            throw err;
        }
    };

    const value = {
        categories,
        menuItems,
        loading,
        error,
        addCategory,
        updateCategory,
        toggleCategoryStatus,
        deleteCategory,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemStatus,
    };

    return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

// --- Hook ---
export const useMenu = () => {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
};
