import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
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
    businessAdresss: string;
    gstNo: string;
    fssaiNo: string;
    logoUrl: string | null;
    taxType: "forward" | "inclusive"; // 'inclusive' reserved for future
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
    businessAdresss: "",
    gstNo: "",
    fssaiNo: "",
    logoUrl: null,
    taxType: "forward",
    taxValueType: "percentage",
    taxValue: 5,
    discountType: "percentage",
    discountValue: 0,
};

const defaultPrinter: PrinterSettings = {
    billPrinter: 'System Default',
    kotPrinter: 'System Default',
    paperSize: '80mm',
    showLogo: false,
    fontSize: 'medium'
};

// --- Context ---
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // State
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const [billing, setBilling] = useState<BillingSettings>(defaultBilling);
    const [printer, setPrinter] = useState<PrinterSettings>(defaultPrinter);

    // Fetch settings from Supabase
    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) {
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
                    console.error('Error fetching settings:', error);
                    // Fall back to localStorage
                    loadFromLocalStorage();
                } else if (data) {
                    // Load from database
                    setProfile(data.profile_data || defaultProfile);
                    setBilling(data.billing_data || defaultBilling);
                    setPrinter(data.printer_data || defaultPrinter);
                } else {
                    // No settings found, use defaults or localStorage
                    loadFromLocalStorage();
                }
            } catch (err) {
                console.error('Error in fetchSettings:', err);
                loadFromLocalStorage();
            } finally {
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
    }, [user]);

    // Sync profile with Supabase user metadata
    useEffect(() => {
        if (user) {
            const metadata = user.user_metadata || {};
            const fullName = metadata.fullName || '';
            const nameParts = fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const syncedProfile = {
                firstName,
                lastName,
                email: user.email || '',
                mobile: metadata.phone || ''
            };

            // Only update if there's actual user data
            if (fullName || metadata.phone || user.email) {
                setProfile(syncedProfile);
            }
        }
    }, [user]);

    // Upsert settings to Supabase
    const saveToDatabase = async (profileData: UserProfile, billingData: BillingSettings, printerData: PrinterSettings) => {
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

    // Persist to localStorage and Supabase when settings change
    useEffect(() => {
        if (!loading && user) {
            localStorage.setItem("pos_profile", JSON.stringify(profile));
            saveToDatabase(profile, billing, printer);
        }
    }, [profile, loading, user]);

    useEffect(() => {
        if (!loading && user) {
            localStorage.setItem("pos_billing", JSON.stringify(billing));
            saveToDatabase(profile, billing, printer);
        }
    }, [billing, loading, user]);

    useEffect(() => {
        if (!loading && user) {
            localStorage.setItem("pos_printer_settings", JSON.stringify(printer));
            saveToDatabase(profile, billing, printer);
        }
    }, [printer, loading, user]);

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
