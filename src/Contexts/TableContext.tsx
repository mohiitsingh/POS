import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

// --- Types ---
export interface Table {
    id: string;
    tableNo: string;
    status: 'active' | 'inactive';
}

interface TableContextType {
    tables: Table[];
    loading: boolean;
    error: string | null;
    addTable: (tableNo: string, status: 'active' | 'inactive') => Promise<void>;
    updateTable: (id: string, updates: Partial<Table>) => Promise<void>;
    deleteTable: (id: string) => Promise<void>;
}

// --- Context ---
const TableContext = createContext<TableContextType | undefined>(undefined);

// --- Provider ---
export const TableProvider = ({ children }: { children: ReactNode }) => {
    const { showError } = useToast();
    const { user, hasPaidSubscription } = useAuth();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch tables from Supabase
    const fetchTables = async () => {
        if (!user) {
            setTables([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('restaurant_tables')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            const mappedTables: Table[] = (data || []).map(table => ({
                id: table.id,
                tableNo: table.table_no,
                status: table.status as 'active' | 'inactive'
            }));

            setTables(mappedTables);
        } catch (err: any) {
            console.error('Error fetching tables:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Load data when user changes — only if they have an active subscription
    useEffect(() => {
        if (!hasPaidSubscription) {
            setTables([]);
            setLoading(false);
            return;
        }
        fetchTables();
    }, [user, hasPaidSubscription]);

    const addTable = async (tableNo: string, status: 'active' | 'inactive') => {
        if (!user) throw new Error('User not authenticated');

        // Check if table already exists
        if (tables.some(t => t.tableNo === tableNo)) {
            showError(`Table ${tableNo} already exists!`);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('restaurant_tables')
                .insert([{
                    user_id: user.id,
                    table_no: tableNo,
                    status: status
                }])
                .select()
                .single();

            if (error) throw error;

            const newTable: Table = {
                id: data.id,
                tableNo: data.table_no,
                status: data.status
            };

            setTables(prev => [...prev, newTable]);
        } catch (err: any) {
            console.error('Error adding table:', err);
            throw err;
        }
    };

    const updateTable = async (id: string, updates: Partial<Table>) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const dbUpdates: any = {};
            if (updates.tableNo !== undefined) dbUpdates.table_no = updates.tableNo;
            if (updates.status !== undefined) dbUpdates.status = updates.status;

            const { error } = await supabase
                .from('restaurant_tables')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            setTables(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
        } catch (err: any) {
            console.error('Error updating table:', err);
            throw err;
        }
    };

    const deleteTable = async (id: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { error } = await supabase
                .from('restaurant_tables')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTables(prev => prev.filter(t => t.id !== id));
        } catch (err: any) {
            console.error('Error deleting table:', err);
            throw err;
        }
    };

    const value = {
        tables,
        loading,
        error,
        addTable,
        updateTable,
        deleteTable,
    };

    return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
};

// --- Hook ---
export const useTables = () => {
    const context = useContext(TableContext);
    if (context === undefined) {
        throw new Error('useTables must be used within a TableProvider');
    }
    return context;
};
