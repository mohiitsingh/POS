import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { parseISO } from 'date-fns';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

// --- Types ---
export interface OrderItem {
    id: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    date: string; // ISO String
    items: OrderItem[];
    total: number;
    status: 'completed' | 'cancelled';
    tableNo?: string;
    paymentMethod: 'Cash' | 'Online';
}

export interface Draft {
    id: string;
    createdAt: string;
    items: any[];
    total: number;
    tableNo?: string;
}

interface OrderContextType {
    orders: Order[];
    drafts: Draft[];
    loading: boolean;
    error: string | null;
    addOrder: (order: Omit<Order, 'id' | 'date'>) => Promise<void>;
    getOrdersByDateRange: (startDate: Date, endDate: Date) => Order[];
    saveDraft: (items: any[], total: number, tableNo?: string) => Promise<void>;
    deleteDraft: (id: string) => Promise<void>;
}

// --- Context ---
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// --- Provider ---
export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch orders from Supabase
    const fetchOrders = async () => {
        if (!user) {
            setOrders([]);
            return;
        }

        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (*)
                `)
                .order('order_date', { ascending: false });

            if (ordersError) throw ordersError;

            const mappedOrders: Order[] = (ordersData || []).map(order => ({
                id: order.id,
                date: order.order_date,
                total: parseFloat(order.total),
                status: order.status as 'completed' | 'cancelled',
                tableNo: order.table_no,
                paymentMethod: order.payment_method as 'Cash' | 'Online',
                items: (order.order_items || []).map((item: any) => ({
                    id: item.id,
                    menuItemId: item.menu_item_id || '',
                    name: item.name,
                    price: parseFloat(item.price),
                    quantity: item.quantity
                }))
            }));

            setOrders(mappedOrders);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.message);
        }
    };

    // Fetch drafts from Supabase
    const fetchDrafts = async () => {
        if (!user) {
            setDrafts([]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('drafts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedDrafts: Draft[] = (data || []).map(draft => ({
                id: draft.id,
                createdAt: draft.created_at,
                items: draft.items,
                total: parseFloat(draft.total),
                tableNo: draft.table_no
            }));

            setDrafts(mappedDrafts);
        } catch (err: any) {
            console.error('Error fetching drafts:', err);
            setError(err.message);
        }
    };

    // Load data when user changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            await Promise.all([fetchOrders(), fetchDrafts()]);
            setLoading(false);
        };

        loadData();
    }, [user]);

    const addOrder = async (orderData: Omit<Order, 'id' | 'date'>) => {
        if (!user) throw new Error('User not authenticated');

        try {
            // 1. Insert order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    total: orderData.total,
                    status: orderData.status,
                    table_no: orderData.tableNo,
                    payment_method: orderData.paymentMethod
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Insert order items
            const orderItems = orderData.items.map(item => ({
                order_id: order.id,
                menu_item_id: item.menuItemId || null,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Refresh orders
            await fetchOrders();
        } catch (err: any) {
            console.error('Error adding order:', err);
            throw err;
        }
    };

    const getOrdersByDateRange = (startDate: Date, endDate: Date) => {
        return orders.filter(order => {
            const orderDate = parseISO(order.date);
            return orderDate >= startDate && orderDate <= endDate;
        });
    };

    // Draft Actions
    const saveDraft = async (items: any[], total: number, tableNo?: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { data, error } = await supabase
                .from('drafts')
                .insert([{
                    user_id: user.id,
                    items: items,
                    total: total,
                    table_no: tableNo
                }])
                .select()
                .single();

            if (error) throw error;

            const newDraft: Draft = {
                id: data.id,
                createdAt: data.created_at,
                items: data.items,
                total: parseFloat(data.total),
                tableNo: data.table_no
            };

            setDrafts(prev => [newDraft, ...prev]);
        } catch (err: any) {
            console.error('Error saving draft:', err);
            throw err;
        }
    };

    const deleteDraft = async (id: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { error } = await supabase
                .from('drafts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setDrafts(prev => prev.filter(d => d.id !== id));
        } catch (err: any) {
            console.error('Error deleting draft:', err);
            throw err;
        }
    };

    const value = {
        orders,
        drafts,
        loading,
        error,
        addOrder,
        getOrdersByDateRange,
        saveDraft,
        deleteDraft
    };

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

// --- Hook ---
export const useOrders = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within a OrderProvider');
    }
    return context;
};
