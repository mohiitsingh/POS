import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../../Contexts/SettingsContext";
import { useAuth } from "../../../Contexts/AuthContext";
import { useToast } from "../../../Contexts/ToastContext";
import { Save, ShieldCheck } from "lucide-react";
import { supabase } from "../../../config/supabase";
import DOMPurify from "dompurify";

const ProfileSettings = () => {
    const { profile, updateProfile } = useSettings();
    const { user, hasPaidSubscription, isFreeTrialActive, daysUntilTrialEnds } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(profile);

    // Subscription details state
    const [activePlan, setActivePlan] = useState<{ title: string; expires_at: string | null; loading: boolean }>({
        title: "",
        expires_at: null,
        loading: true,
    });

    // Sync form when profile loads asynchronously from Supabase
    useEffect(() => {
        setFormData(profile);
    }, [profile]);

    // Fetch exact active plan name and expiration
    useEffect(() => {
        const fetchSubscriptionDetails = async () => {
            if (!user?.id || !hasPaidSubscription) {
                setActivePlan((prev) => ({ ...prev, loading: false }));
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("subscriptions")
                    .select("expires_at, plan_id")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .maybeSingle();

                if (!error && data) {
                    // Type assertion since `.select('plans(title)')` returns an array or single obj depending on relationship,
                    // but usually an object when referencing a parent table.
                    // const planTitle = Array.isArray(data.plan_id) ? data.plan_id[0]?.title : (data.plan_id as any)?.title;
                    const planTitle = data.plan_id.toUpperCase();
                    setActivePlan({
                        title: planTitle || "Pro Plan",
                        expires_at: data.expires_at,
                        loading: false,
                    });
                } else {
                    setActivePlan((prev) => ({ ...prev, loading: false }));
                }
            } catch (err) {
                console.error("Failed to fetch plan details:", err);
                setActivePlan((prev) => ({ ...prev, loading: false }));
            }
        };

        fetchSubscriptionDetails();
    }, [user?.id, hasPaidSubscription]);

    // Password State
    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const firstName = DOMPurify.sanitize(formData.firstName.trim());
        const lastName = DOMPurify.sanitize(formData.lastName.trim());
        const mobile = DOMPurify.sanitize(formData.mobile.trim());

        // Validation logic could go here
        if (!firstName) {
            showError("First Name is required");
            return;
        }
        updateProfile({ ...formData, firstName, lastName, mobile });

        // Mock password save
        if (passwordData.newPassword) {
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                showError("Passwords do not match");
                return;
            }
            // Regex for 8 chars, 1 number, 1 special
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(passwordData.newPassword)) {
                showError("Password must be at least 8 characters with 1 number and 1 special char.");
                return;
            }
            showSuccess("Profile and Password updated successfully!");
            setPasswordData({ newPassword: "", confirmPassword: "" });
        } else {
            showSuccess("Profile updated successfully!");
        }
    };

    return (
        <div className="settings-form-section">
            <h2 className="section-title">Personal Information</h2>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        className="form-input"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        className="form-input"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        className="form-input"
                        value={formData.email}
                        disabled
                        style={{ opacity: 0.55, cursor: 'not-allowed', background: 'var(--color-border, #e2e8f0)' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light, #94a3b8)', marginTop: '4px', display: 'block' }}>
                        Email is managed by your account and cannot be changed here.
                    </span>
                </div>
                <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                        type="tel"
                        name="mobile"
                        className="form-input"
                        value={formData.mobile}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <h2 className="section-title" style={{ marginTop: '2rem' }}>Change Password</h2>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        className="form-input"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Min 8 chars, 1 number, 1 special"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className="form-input"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Retype password"
                    />
                </div>
            </div>

            <div className="form-actions">
                <button className="btn-primary" onClick={handleSave}>
                    <Save size={18} /> Save Profile
                </button>
            </div>

            <hr style={{ margin: "3rem 0", border: 0, borderTop: "1px solid var(--color-border)" }} />

            <h2 className="section-title">Subscription &amp; Plan</h2>
            <div className="setting-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                {activePlan.loading ? (
                    <p style={{ color: 'var(--color-text-light)' }}>Loading plan details...</p>
                ) : hasPaidSubscription ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={24} color="var(--color-primary)" />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>Active: {activePlan.title}</h3>
                        </div>
                        {activePlan.expires_at && !isNaN(new Date(activePlan.expires_at).getTime()) && (
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
                                Your subscription will renew/end on <strong>{new Date(activePlan.expires_at).toLocaleDateString("en-IN")}</strong>.
                            </p>
                        )}
                    </>
                ) : isFreeTrialActive ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24' }}></div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>Free Trial Plan</h3>
                        </div>
                        <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
                            You have <strong>{daysUntilTrialEnds} days</strong> remaining on your free trial.
                        </p>
                        <div style={{ marginTop: '0.5rem' }}>
                            <button className="btn-primary" onClick={() => navigate("/onboarding", { state: { explicitSubscribe: true } })}>
                                Upgrade to Pro Plans
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>Free Plan (Trial Expired)</h3>
                        </div>
                        <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
                            Your free trial has ended. Upgrade to continue using premium features.
                        </p>
                        <div style={{ marginTop: '0.5rem' }}>
                            <button className="btn-primary" onClick={() => navigate("/onboarding", { state: { explicitSubscribe: true } })}>
                                Upgrade to Pro Plans
                            </button>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default ProfileSettings;
