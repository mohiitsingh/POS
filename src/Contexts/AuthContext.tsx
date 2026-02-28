import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';

// ─── Subscription cache helpers (localStorage, 30-min TTL) ──────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(userId: string) {
    return `sub_cache_${userId}`;
}

function readSubscriptionCache(userId: string): boolean | null {
    try {
        const raw = localStorage.getItem(getCacheKey(userId));
        if (!raw) return null;
        const { value, expiresAt } = JSON.parse(raw) as { value: boolean; expiresAt: number };
        if (Date.now() > expiresAt) {
            localStorage.removeItem(getCacheKey(userId));
            return null; // expired
        }
        return value;
    } catch {
        return null;
    }
}

function writeSubscriptionCache(userId: string, value: boolean) {
    try {
        localStorage.setItem(
            getCacheKey(userId),
            JSON.stringify({ value, expiresAt: Date.now() + CACHE_TTL_MS })
        );
    } catch { /* storage full or unavailable — silently skip */ }
}

function clearSubscriptionCache(userId?: string) {
    if (userId) {
        localStorage.removeItem(getCacheKey(userId));
    }
}
// ────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    hasPaidSubscription: boolean;
    subscriptionLoading: boolean;
    refreshSubscription: () => Promise<void>;
    signUp: (email: string, password: string, metadata: UserMetadata) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    resendVerificationEmail: (email: string) => Promise<void>;
}

interface UserMetadata {
    fullName: string;
    phone?: string;
    role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasPaidSubscription, setHasPaidSubscription] = useState(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);

    const checkSubscription = useCallback(async (userId: string | undefined) => {
        if (!userId) {
            setHasPaidSubscription(false);
            return;
        }

        // ── 1. Try the 30-minute localStorage cache first ─────────────────────
        const cached = readSubscriptionCache(userId);
        if (cached !== null) {
            setHasPaidSubscription(cached);
            return;
        }

        // ── 2. Cache miss or expired → fetch from Supabase ────────────────────
        setSubscriptionLoading(true);
        try {
            // First: auto-expire any overdue subscriptions on the server side
            await supabase.rpc('expire_stale_subscriptions', { p_user_id: userId });

            // Then: check if an active, non-expired subscription exists
            const { data, error } = await supabase
                .from('subscriptions')
                .select('id, expires_at')
                .eq('user_id', userId)
                .eq('status', 'active')
                .maybeSingle();

            if (error) throw error;

            // Double-guard: subscription must exist AND not be past expires_at
            const hasSub = !!data && (
                !data.expires_at || new Date(data.expires_at) > new Date()
            );

            setHasPaidSubscription(hasSub);
            writeSubscriptionCache(userId, hasSub);
        } catch (err) {
            console.error('Subscription check failed:', err);
            setHasPaidSubscription(false);
        } finally {
            setSubscriptionLoading(false);
        }
    }, []);

    // Force-refresh: clears cache then re-fetches (used after payment)
    const refreshSubscription = useCallback(async () => {
        if (user?.id) clearSubscriptionCache(user.id);
        await checkSubscription(user?.id);
    }, [user?.id, checkSubscription]);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            checkSubscription(session?.user?.id);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            checkSubscription(session?.user?.id);
        });

        return () => subscription.unsubscribe();
    }, [checkSubscription]);

    const signUp = async (email: string, password: string, metadata: UserMetadata) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    fullName: metadata.fullName,
                    phone: metadata.phone,
                    role: metadata.role || 'NA',
                },
                emailRedirectTo: `${import.meta.env.VITE_SITE_URL}/verify-email`,
            },
        });

        if (error) throw error;
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (error) throw error;
    };

    const resendVerificationEmail = async (email: string) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: `${import.meta.env.VITE_SITE_URL}/verify-email`,
            },
        });

        if (error) throw error;
    };

    const signOut = async () => {
        if (user?.id) clearSubscriptionCache(user.id);
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const value = {
        user,
        session,
        loading,
        hasPaidSubscription,
        subscriptionLoading,
        refreshSubscription,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resendVerificationEmail,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
