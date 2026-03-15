import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Building2, Sparkles, ShieldCheck } from "lucide-react";
import { useSettings } from "../../Contexts/SettingsContext";
import { supabase } from "../../config/supabase";
import "./OnboardingModal.css";

interface OnboardingModalProps {
    onComplete?: () => void;
}


/* ── DB row shape from the `plans` table ── */
interface Plan {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    badge_class: string;
    price_per_month: number;
    total_amount: number;
    amount_paise: number;
    months: number;
    old_price: number | null;
    discount_label: string | null;
    total_label: string;
    features: string[];
    sort_order: number;
}

/* UI tier class map (keeps CSS decoupled from DB data) */
const TIER_CLASS: Record<string, string> = {
    monthly: "ob-card-basic",
    sixmonths: "ob-card-pro",
    annual: "ob-card-elite",
};

// Steps: 1 = Biz info, 2 = Plan selection, 3 = Payment confirmation
type Step = 1 | 2 | 3;

const OnboardingModal = (_props: OnboardingModalProps) => {
    const { billing, updateBilling } = useSettings();

    const [step, setStep] = useState<Step>(1);
    const navigate = useNavigate();

    /* ── Plans from DB ── */
    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [plansError, setPlansError] = useState("");

    useEffect(() => {
        supabase
            .from("plans")
            .select("*")
            .order("sort_order", { ascending: true })
            .then(({ data, error }) => {
                if (error || !data) {
                    setPlansError("Failed to load plans. Please refresh.");
                } else {
                    setPlans(data as Plan[]);
                }
                setPlansLoading(false);
            });
    }, []);

    /* ── Biz form ── */
    const [bizForm, setBizForm] = useState({
        businessName: billing.businessName || "",
        gstNo: billing.gstNo || "",
        fssaiNo: billing.fssaiNo || "",
        businessAdresss: billing.businessAdresss || "",
        businessPhone: billing.businessPhone || "",
    });
    const [bizErrors, setBizErrors] = useState<Record<string, string>>({});

    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [planError, setPlanError] = useState(false);

    /* ── Terms check ── */
    const [termsAccepted, setTermsAccepted] = useState(false);

    /* ---------- Step 1 ---------- */
    const handleBizChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBizForm((prev) => ({ ...prev, [name]: value }));
        if (bizErrors[name]) setBizErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSaveAndContinue = () => {
        if (!bizForm.businessName.trim()) {
            setBizErrors({ businessName: "Business name is required" });
            return;
        }
        updateBilling({ ...billing, ...bizForm });
        setStep(2);
    };

    const handleSkip = () => setStep(2);

    /* ---------- Step 2 ---------- */
    const handleSelectPlan = (planId: string) => {
        setSelectedPlan(planId);
        setPlanError(false);
    };

    const handleGetStarted = () => {
        if (!selectedPlan) {
            setPlanError(true);
            return;
        }
        setStep(3);
    };

    /* ---------- Step 3 – Navigate to Payment Page ---------- */
    const handleConfirmPayment = () => {
        if (!selectedPlanDetails) return;
        navigate("/payment", {
            state: {
                planId: selectedPlanDetails.id,
                planTitle: selectedPlanDetails.title,
                totalLabel: selectedPlanDetails.total_label,
                totalAmount: selectedPlanDetails.total_amount,
                explicitSubscribe: true,
            },
        });
    };

    const selectedPlanDetails = plans.find((p) => p.id === selectedPlan);

    return (
        <div className="onboarding-overlay">
            <div className={`onboarding-container${step === 2 ? " ob-step2" : ""}`}>
                {/* Step Dots */}
                <div className="ob-step-indicator">
                    <div className={`ob-step-dot ${step === 1 ? "active" : "done"}`} />
                    <div className={`ob-step-dot ${step === 2 ? "active" : step > 2 ? "done" : ""}`} />
                    <div className={`ob-step-dot ${step === 3 ? "active" : ""}`} />
                </div>

                {/* ======================== STEP 1 ======================== */}
                {step === 1 && (
                    <div className="ob-card">
                        <div className="ob-header">
                            <span className="ob-badge">
                                <Building2 size={13} /> Step 1 of 3
                            </span>
                            <h2>Tell us about your business</h2>
                            <p>
                                Help us personalise your billing experience. You can always
                                update these in Settings.
                            </p>
                        </div>

                        <div className="ob-form">
                            {/* Business Name */}
                            <div className="ob-field">
                                <label className="ob-label">Business Name</label>
                                <input
                                    type="text"
                                    name="businessName"
                                    className={`ob-input${bizErrors.businessName ? " error" : ""}`}
                                    placeholder="e.g. Arambh Cafe"
                                    value={bizForm.businessName}
                                    onChange={handleBizChange}
                                />
                                {bizErrors.businessName && (
                                    <span className="ob-error-text">{bizErrors.businessName}</span>
                                )}
                            </div>

                            {/* GST + FSSAI */}
                            <div className="ob-form-row">
                                <div className="ob-field">
                                    <label className="ob-label">
                                        GST Number
                                        <span className="ob-optional">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="gstNo"
                                        className="ob-input"
                                        placeholder="e.g. 27AAPFU0939F1ZV"
                                        value={bizForm.gstNo}
                                        onChange={handleBizChange}
                                    />
                                </div>
                                <div className="ob-field">
                                    <label className="ob-label">
                                        FSSAI Number
                                        <span className="ob-optional">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fssaiNo"
                                        className="ob-input"
                                        placeholder="e.g. 11225020000123"
                                        value={bizForm.fssaiNo}
                                        onChange={handleBizChange}
                                    />
                                </div>
                            </div>

                            {/* Business Address */}
                            <div className="ob-field">
                                <label className="ob-label">Business Address</label>
                                <input
                                    type="text"
                                    name="businessAdresss"
                                    className="ob-input"
                                    placeholder="e.g. 12 MG Road, Bengaluru, Karnataka"
                                    value={bizForm.businessAdresss}
                                    onChange={handleBizChange}
                                />
                            </div>

                            {/* Business Phone */}
                            <div className="ob-field">
                                <label className="ob-label">
                                    Business Phone
                                    <span className="ob-optional">(optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    name="businessPhone"
                                    className="ob-input"
                                    placeholder="e.g. +91 98765 43210"
                                    value={bizForm.businessPhone}
                                    onChange={handleBizChange}
                                />
                            </div>
                        </div>

                        <div className="ob-actions">
                            <button className="ob-btn-skip" onClick={handleSkip}>
                                Skip for now
                            </button>
                            <button className="ob-btn-primary" onClick={handleSaveAndContinue}>
                                Save &amp; Continue <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ======================== STEP 2 ======================== */}
                {step === 2 && (
                    <>
                        {/* Header card */}
                        <div className="ob-card ob-step2-header">
                            <div className="ob-header">
                                <span className="ob-badge">
                                    <Sparkles size={13} /> Step 2 of 3
                                </span>
                                <h2>Choose your plan</h2>
                                {/* <p>Select a plan to get started. All plans include a 2-month free trial.</p> */}
                            </div>
                        </div>

                        {/* Pricing cards grid */}
                        <div className="ob-pricing-grid">
                            {plansLoading ? (
                                /* Skeleton loaders while fetching */
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="ob-pricing-card ob-card-basic ob-skeleton" />
                                ))
                            ) : plansError ? (
                                <div className="ob-plan-error" style={{ gridColumn: "1 / -1" }}>
                                    {plansError}
                                </div>
                            ) : (
                                plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`ob-pricing-card ${TIER_CLASS[plan.id] ?? "ob-card-basic"}${selectedPlan === plan.id ? " ob-selected" : ""}`}
                                        onClick={() => handleSelectPlan(plan.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === "Enter" && handleSelectPlan(plan.id)}
                                    >
                                        {/* Selection checkmark */}
                                        <span className="ob-check-mark">
                                            <Check size={11} strokeWidth={3} />
                                        </span>

                                        {/* Discount pill */}
                                        {plan.discount_label && (
                                            <div className="ob-discount-pill">{plan.discount_label}</div>
                                        )}

                                        <div className={`ob-card-badge ${plan.badge_class}`}>
                                            {plan.badge}
                                        </div>

                                        <div className="ob-card-title">{plan.title}</div>
                                        <div className="ob-card-subtitle">{plan.subtitle}</div>

                                        <div className="ob-price-block">
                                            <span className="ob-currency">₹</span>
                                            <span className="ob-amount">{plan.price_per_month}</span>
                                            <span className="ob-period">/mo</span>
                                            {plan.old_price && (
                                                <span className="ob-old-price">₹{plan.old_price}</span>
                                            )}
                                        </div>

                                        <ul className="ob-features-list">
                                            {plan.features.map((f) => (
                                                <li key={f}>
                                                    <Check size={14} className="ob-check-icon" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            className="btn-primary-solid pricing-btn"
                                            style={{ width: "100%" }}
                                        >
                                            Pay Now
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Action footer */}
                        <div className="ob-step2-footer">
                            {planError && (
                                <div className="ob-plan-error">
                                    Please select a plan to continue
                                </div>
                            )}
                            <div className="ob-actions">
                                <button className="ob-btn-skip" onClick={() => setStep(1)}>
                                    ← Back
                                </button>
                                <button className="ob-btn-primary" onClick={handleGetStarted}>
                                    Get Started <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* ======================== STEP 3 – Payment Confirmation ======================== */}
                {step === 3 && selectedPlanDetails && (
                    <div className="ob-card">
                        <div className="ob-header">
                            <span className="ob-badge">
                                <ShieldCheck size={13} /> Step 3 of 3
                            </span>
                            <h2>Confirm &amp; Activate</h2>
                            <p>Review your plan and activate your subscription.</p>
                        </div>

                        {/* Order summary */}
                        <div className="ob-order-summary">
                            <div className="ob-order-row">
                                <span className="ob-order-label">Plan</span>
                                <span className="ob-order-value">{selectedPlanDetails.title}</span>
                            </div>
                            <div className="ob-order-row">
                                <span className="ob-order-label">Price</span>
                                <span className="ob-order-value">
                                    ₹{selectedPlanDetails.price_per_month}/mo
                                </span>
                            </div>
                            {selectedPlanDetails.discount_label && (
                                <div className="ob-order-row ob-order-discount">
                                    <span className="ob-order-label">Discount</span>
                                    <span className="ob-order-value">{selectedPlanDetails.discount_label}</span>
                                </div>
                            )}
                            <div className="ob-order-divider" />
                            <div className="ob-order-row ob-order-total">
                                <span className="ob-order-label">Total</span>
                                <span className="ob-order-value">{selectedPlanDetails.total_label}</span>
                            </div>
                        </div>

                        <div className="ob-payment-note">
                            🔒 Payments are 100% secure. You can cancel anytime.
                        </div>

                        <div className="ob-terms-checkbox" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '1rem 0', fontSize: '0.85rem', color: 'var(--color-text-light)', textAlign: 'left' }}>
                            <input 
                                type="checkbox" 
                                id="acceptTerms" 
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                style={{ marginTop: '3px', cursor: 'pointer' }}
                            />
                            <label htmlFor="acceptTerms" style={{ cursor: 'pointer' }}>
                                I accept the <a href="/terms" target="_blank" style={{ color: 'var(--color-primary)' }}>Terms and Conditions</a> and have read the <a href="/privacy" target="_blank" style={{ color: 'var(--color-primary)' }}>Privacy Policy</a>. *
                            </label>
                        </div>

                        <div className="ob-actions">
                            <button
                                className="ob-btn-skip"
                                onClick={() => setStep(2)}
                            >
                                ← Back
                            </button>
                            <button
                                className="ob-btn-primary"
                                onClick={handleConfirmPayment}
                                disabled={!termsAccepted}
                                style={{ opacity: termsAccepted ? 1 : 0.5, cursor: termsAccepted ? 'pointer' : 'not-allowed' }}
                            >
                                Proceed to Pay <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingModal;
