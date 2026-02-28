import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../config/supabase";

// --- Types ---
export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
}

export interface BillingSettings {
    businessName: string;
    businessPhone: string;
    businessAdresss: string;
    gstNo: string;
    fssaiNo: string;
    logoUrl: string | null;
    taxType: "forward" | "inclusive";
    taxValueType: "percentage" | "fixed";
    taxValue: number;
    discountType: "percentage" | "fixed";
    discountValue: number;
}

export interface PrinterSettings {
    billPrinter: string;
    kotPrinter: string;
    paperSize: '58mm' | '80mm';
    showLogo: boolean;
    fontSize: 'small' | 'medium' | 'large';
}

interface SettingsContextType {
    profile: UserProfile;
    updateProfile: (data: UserProfile) => void;
    billing: BillingSettings;
    updateBilling: (data: BillingSettings) => void;
    printer: PrinterSettings;
    updatePrinter: (data: PrinterSettings) => void;
    loading: boolean;
}

// --- Defaults ---
const defaultProfile: UserProfile = {
    firstName: "",
    lastName: "",
    email: "",
    mobile: ""
};

const defaultBilling: BillingSettings = {
    businessName: "",
    businessPhone: "",
    businessAdresss: "",
    gstNo: "",
    fssaiNo: "",
    logoUrl: null,
    taxType: "forward",
    taxValueType: "percentage",
    taxValue: 0,
    discountType: "percentage",
    discountValue: 0,
};

const defaultPrinter: PrinterSettings = {
    billPrinter: '',
    kotPrinter: '',
    paperSize: '80mm',
    showLogo: false,
    fontSize: 'medium'
};

// --- Context ---
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const { user, hasPaidSubscription } = useAuth();
    const [loading, setLoading] = useState(true);

    // Track whether we have finished the initial fetch — auto-saves must NOT run until then
    const fetchedRef = useRef(false);

    // State
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const [billing, setBilling] = useState<BillingSettings>(defaultBilling);
    const [printer, setPrinter] = useState<PrinterSettings>(defaultPrinter);

    // Upsert settings to Supabase
    const saveToDatabase = async (
        profileData: UserProfile,
        billingData: BillingSettings,
        printerData: PrinterSettings
    ) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    profile_data: profileData,
                    billing_data: billingData,
                    printer_data: printerData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) {
                console.error('Error saving settings:', error);
            }
        } catch (err) {
            console.error('Error in saveToDatabase:', err);
        }
    };

    // Fetch settings from Supabase on login — only if they have an active subscription
    useEffect(() => {
        const fetchSettings = async () => {
            // Reset fetch guard whenever user changes
            fetchedRef.current = false;
            setLoading(true);

            if (!user || !hasPaidSubscription) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('user_settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    // Real error — fall back to localStorage
                    console.error('Error fetching settings:', error);
                    loadFromLocalStorage();
                } else if (data) {
                    // Load all three settings from DB
                    const savedProfile: UserProfile = data.profile_data || defaultProfile;
                    const savedBilling: BillingSettings = data.billing_data || defaultBilling;
                    const savedPrinter: PrinterSettings = data.printer_data || defaultPrinter;

                    // Always ensure email is up-to-date from auth (it's the source of truth)
                    savedProfile.email = user.email || savedProfile.email;

                    setProfile(savedProfile);
                    setBilling(savedBilling);
                    setPrinter(savedPrinter);
                } else {
                    // No row yet — seed profile with auth metadata, use defaults for rest
                    const metadata = user.user_metadata || {};
                    const fullName = metadata.fullName || '';
                    const nameParts = fullName.trim().split(' ');
                    setProfile({
                        firstName: nameParts[0] || '',
                        lastName: nameParts.slice(1).join(' ') || '',
                        email: user.email || '',
                        mobile: metadata.phone || ''
                    });
                    setBilling(defaultBilling);
                    setPrinter(defaultPrinter);

                    // Also check localStorage as secondary fallback
                    loadFromLocalStorage();
                }
            } catch (err) {
                console.error('Error in fetchSettings:', err);
                loadFromLocalStorage();
            } finally {
                fetchedRef.current = true;
                setLoading(false);
            }
        };

        const loadFromLocalStorage = () => {
            const savedProfile = localStorage.getItem("pos_profile");
            const savedBilling = localStorage.getItem("pos_billing");
            const savedPrinter = localStorage.getItem("pos_printer_settings");

            if (savedProfile) setProfile(JSON.parse(savedProfile));
            if (savedBilling) setBilling(JSON.parse(savedBilling));
            if (savedPrinter) setPrinter(JSON.parse(savedPrinter));
        };

        fetchSettings();
    }, [user, hasPaidSubscription]);

    // Auto-save profile whenever it changes — but ONLY after initial fetch is done
    useEffect(() => {
        if (!fetchedRef.current || loading || !user) return;
        localStorage.setItem("pos_profile", JSON.stringify(profile));
        saveToDatabase(profile, billing, printer);
    }, [profile]);

    // Auto-save billing whenever it changes
    useEffect(() => {
        if (!fetchedRef.current || loading || !user) return;
        localStorage.setItem("pos_billing", JSON.stringify(billing));
        saveToDatabase(profile, billing, printer);
    }, [billing]);

    // Auto-save printer whenever it changes
    useEffect(() => {
        if (!fetchedRef.current || loading || !user) return;
        localStorage.setItem("pos_printer_settings", JSON.stringify(printer));
        saveToDatabase(profile, billing, printer);
    }, [printer]);

    // Actions
    const updateProfile = (data: UserProfile) => setProfile(data);
    const updateBilling = (data: BillingSettings) => setBilling(data);
    const updatePrinter = (data: PrinterSettings) => setPrinter(data);

    return (
        <SettingsContext.Provider value={{
            profile, updateProfile,
            billing, updateBilling,
            printer, updatePrinter,
            loading
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error("useSettings must be used within SettingsProvider");
    return context;
};
