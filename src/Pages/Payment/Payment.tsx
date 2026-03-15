import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Copy, Check, Loader2, ImageUp } from "lucide-react";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../Contexts/AuthContext";
import "./Payment.css";

const UPI_ID = "ms1069@axl";

interface LocationState {
    planId: string;
    planTitle: string;
    totalLabel: string;
    totalAmount: number; // INR (not paise)
}

interface FormData {
    phone: string;
    transactionId: string;
    screenshot: File | null;
}

interface FormErrors {
    phone?: string;
    transactionId?: string;
}

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const state = location.state as LocationState | null;

    // If no plan info passed, redirect back to onboarding
    useEffect(() => {
        if (!state?.planId) navigate("/onboarding", { replace: true, state: { explicitSubscribe: true } });
    }, [state, navigate]);

    const [copied, setCopied] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState("");

    const [form, setForm] = useState<FormData>({
        phone: "",
        transactionId: "",
        screenshot: null,
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const handleCopy = () => {
        navigator.clipboard.writeText(UPI_ID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setForm((prev) => ({ ...prev, screenshot: file }));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
            newErrors.phone = "Enter a valid 10-digit phone number";
        }
        if (!form.transactionId.trim() || form.transactionId.trim().length < 6) {
            newErrors.transactionId = "Enter a valid UTR / Transaction ID";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate() || !state || !user) return;

        setSubmitting(true);
        setServerError("");

        try {
            // Upload screenshot to Supabase Storage if provided
            let screenshotUrl: string | null = null;
            if (form.screenshot) {
                const ext = form.screenshot.name.split(".").pop();
                const path = `payment-proofs/${user.id}_${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("payment-screenshots")
                    .upload(path, form.screenshot, { upsert: true });
                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from("payment-screenshots")
                        .getPublicUrl(path);
                    screenshotUrl = urlData.publicUrl;
                }
            }

            // Insert a pending payment verification request
            const { error } = await supabase.from("payment_verifications").insert({
                user_id: user.id,
                plan_id: state.planId,
                phone: form.phone.trim(),
                email: user?.email ?? "",
                transaction_id: form.transactionId.trim(),
                screenshot_url: screenshotUrl,
                status: "pending",
            });

            if (error) throw error;

            setSubmitted(true);
        } catch (err: any) {
            console.error("Payment submission error:", err);
            setServerError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };


    if (!state) return null;

    return (
        <div className="payment-page-wrapper">
            {/* ── Success Overlay Modal ── */}
            {submitted && (
                <div className="pay-modal-backdrop">
                    <div className="pay-modal">
                        <div className="pay-modal-icon">🙏</div>
                        <h2 className="pay-modal-title">Thank you for choosing Arambh.</h2>
                        <p className="pay-modal-body">
                            We are currently verifying your payment.<br />
                            Access will be enabled shortly.
                        </p>
                        <p className="pay-modal-note">We appreciate your patience.</p>
                        <button
                            className="pay-submit-btn"
                            style={{ marginTop: "0.5rem", width: "100%" }}
                            onClick={() => {
                                navigate("/dashboard", { replace: true });
                            }}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
            {/* Top Bar */}
            <div className="payment-topbar">
                <span className="payment-topbar-logo">Arambh</span>
                <button className="payment-topbar-back" onClick={() => navigate("/onboarding", { state: { explicitSubscribe: true } })}>
                    <ArrowLeft size={15} /> Back to Plans
                </button>
            </div>

            <div className="payment-content">
                {/* ── LEFT: UPI Info ── */}
                <div className="payment-card">
                    <div className="payment-card-title">Step 1 — Send Payment</div>

                    {/* Plan summary */}
                    <div className="pay-plan-summary">
                        <div className="pay-plan-row">
                            <span>Plan</span>
                            <span>{state.planTitle}</span>
                        </div>
                        <div className="pay-plan-row">
                            <span>Total</span>
                            <span>{state.totalLabel}</span>
                        </div>
                    </div>

                    {/* UPI block */}
                    <div className="pay-upi-block">
                        {/* Amount badge */}
                        <div className="pay-amount-badge">
                            <span className="currency">₹</span>
                            <span className="amount">{state.totalAmount.toLocaleString("en-IN")}</span>
                        </div>

                        {/* UPI ID row */}
                        <div className="pay-upi-id-row">
                            <span className="pay-upi-label">UPI ID</span>
                            <span className="pay-upi-value">{UPI_ID}</span>
                            <button className="pay-copy-btn" onClick={handleCopy} title="Copy UPI ID">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>

                        <div className="pay-instructions">
                            Open any UPI app (GPay, PhonePe, Paytm, etc.)<br />
                            Send <strong>exactly ₹{state.totalAmount.toLocaleString("en-IN")}</strong> to the UPI ID above.<br />
                            Then fill the form on the right to verify your payment.
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Verification Form ── */}
                <div className="payment-card">
                    {!submitted && (
                        <>
                            <div className="payment-card-title">Step 2 — Verify Your Payment</div>

                            <div className="pay-form">
                                {/* Phone */}
                                <div className="pay-field">
                                    <label className="pay-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className={`pay-input${errors.phone ? " error" : ""}`}
                                        placeholder="e.g. 9876543210"
                                        value={form.phone}
                                        onChange={handleChange}
                                        maxLength={10}
                                    />
                                    {errors.phone && (
                                        <span className="pay-error-text">{errors.phone}</span>
                                    )}
                                </div>

                                {/* Email — read-only from auth */}
                                <div className="pay-field">
                                    <label className="pay-label">Registered Email</label>
                                    <input
                                        type="email"
                                        className="pay-input"
                                        value={user?.email ?? ""}
                                        readOnly
                                        disabled
                                        style={{ opacity: 0.6, cursor: "not-allowed" }}
                                    />
                                </div>

                                {/* Transaction ID */}
                                <div className="pay-field">
                                    <label className="pay-label">Transaction / UTR ID</label>
                                    <input
                                        type="text"
                                        name="transactionId"
                                        className={`pay-input${errors.transactionId ? " error" : ""}`}
                                        placeholder="e.g. 407912345678"
                                        value={form.transactionId}
                                        onChange={handleChange}
                                    />
                                    {errors.transactionId && (
                                        <span className="pay-error-text">{errors.transactionId}</span>
                                    )}
                                </div>

                                {/* Screenshot upload */}
                                <div className="pay-field">
                                    <label className="pay-label">
                                        Screenshot <span>(optional)</span>
                                    </label>
                                    <div className={`pay-upload-zone${form.screenshot ? " has-file" : ""}`}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <ImageUp size={24} className="pay-upload-icon" />
                                        <span className="pay-upload-text">
                                            {form.screenshot
                                                ? form.screenshot.name
                                                : "Click to upload payment screenshot"}
                                        </span>
                                    </div>
                                </div>

                                {serverError && (
                                    <span className="pay-error-text">{serverError}</span>
                                )}

                                <button
                                    className="pay-submit-btn"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="pay-spinner" />
                                            Submitting…
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Submit for Verification
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payment;
