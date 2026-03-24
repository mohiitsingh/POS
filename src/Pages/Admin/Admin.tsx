import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { supabase } from "../../config/supabase";
import { Loader2, CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import "./Admin.css";


interface Verification {
    id: string;
    user_id: string;
    plan_id: string;
    phone: string;
    email: string;
    transaction_id: string;
    screenshot_url: string | null;
    status: "pending" | "approved" | "rejected";
    admin_note: string | null;
    created_at: string;
    // Joined from plans
    plans: { title: string; total_amount: number } | null;
}

interface DemoRequest {
    id: string;
    name: string;
    phone: string;
    email: string;
    state: string;
    city: string;
    request_type?: string;
    status: "pending" | "contacted";
    created_at: string;
}

type Filter = "all" | "pending" | "approved" | "rejected";
type DemoFilter = "all" | "pending" | "contacted";

interface RecommendedPrinter {
    id: string;
    name: string;
    image_url: string;
    description: string;
    buy_link: string;
    created_at: string;
}

const AdminPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("pending");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    // Demo Requests State
    const [currentView, setCurrentView] = useState<"payments" | "demos" | "printers">("payments");
    const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
    const [demoFilter, setDemoFilter] = useState<DemoFilter>("pending");
    const [demoProcessingId, setDemoProcessingId] = useState<string | null>(null);

    // Printers State
    const [printers, setPrinters] = useState<RecommendedPrinter[]>([]);
    const [isAddPrinterOpen, setIsAddPrinterOpen] = useState(false);
    const [printerForm, setPrinterForm] = useState({ name: "", image_url: "", description: "", buy_link: "" });
    const [printerSubmitStatus, setPrinterSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [printerProcessingId, setPrinterProcessingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("payment_verifications")
            .select("*, plans(title, total_amount)")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setVerifications(data as Verification[]);
        }
        setLoading(false);
    }, []);

    const fetchDemoRequests = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("demo_requests")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setDemoRequests(data as DemoRequest[]);
        }
        setLoading(false);
    }, []);

    const fetchPrinters = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("recommended_printers")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setPrinters(data as RecommendedPrinter[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (currentView === "payments") {
            fetchData();
        } else if (currentView === "demos") {
            fetchDemoRequests();
        } else if (currentView === "printers") {
            fetchPrinters();
        }
    }, [currentView, fetchData, fetchDemoRequests, fetchPrinters]);

    const handleAction = async (verificationId: string, action: "approve" | "reject") => {
        if (processingId) return;
        setProcessingId(verificationId);

        try {
            const rawNote = notes[verificationId] || "";
            const sanitizedNote = rawNote ? DOMPurify.sanitize(rawNote.trim()) : null;

            const { data, error } = await supabase.functions.invoke("admin-approve-payment", {
                body: {
                    verification_id: verificationId,
                    action,
                    admin_note: sanitizedNote,
                },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            // Optimistically update local state
            setVerifications((prev) =>
                prev.map((v) =>
                    v.id === verificationId
                        ? { ...v, status: data.status, admin_note: notes[verificationId] || v.admin_note }
                        : v
                )
            );
        } catch (err: any) {
            console.error("Admin action failed:", err);
            alert("Action failed: " + (err.message || JSON.stringify(err)));
        } finally {
            setProcessingId(null);
        }
    };

    const handleDemoAction = async (requestId: string, action: "contacted") => {
        if (demoProcessingId) return;
        setDemoProcessingId(requestId);

        try {
            const { error } = await supabase
                .from("demo_requests")
                .update({ status: action })
                .eq("id", requestId);

            if (error) throw error;

            // Optimistically update local state
            setDemoRequests((prev) =>
                prev.map((r) =>
                    r.id === requestId ? { ...r, status: action } : r
                )
            );
        } catch (err: any) {
            console.error("Demo action failed:", err);
            alert("Action failed: " + (err.message || JSON.stringify(err)));
        } finally {
            setDemoProcessingId(null);
        }
    };

    const handleAddPrinter = async (e: React.FormEvent) => {
        e.preventDefault();
        setPrinterSubmitStatus("submitting");

        const sanitizedDescription = DOMPurify.sanitize(printerForm.description.trim());
        const sanitizedName = DOMPurify.sanitize(printerForm.name.trim());

        const wordCount = sanitizedDescription.split(/\s+/).length;
        if (wordCount > 250) {
            setPrinterSubmitStatus("error");
            alert(`Description is ${wordCount} words. Maximum allowed is 250.`);
            return;
        }

        try {
            const { error } = await supabase.from("recommended_printers").insert([{
                ...printerForm,
                name: sanitizedName,
                description: sanitizedDescription
            }]);
            if (error) throw error;
            setPrinterForm({ name: "", image_url: "", description: "", buy_link: "" });
            setIsAddPrinterOpen(false);
            setPrinterSubmitStatus("success");
            fetchPrinters();
        } catch (err: any) {
            console.error("Failed to add printer:", err);
            setPrinterSubmitStatus("error");
            alert("Failed to add printer: " + (err.message || JSON.stringify(err)));
        }
    };

    const handleDeletePrinter = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this printer?")) return;
        setPrinterProcessingId(id);

        try {
            const { error } = await supabase.from("recommended_printers").delete().eq("id", id);
            if (error) throw error;
            setPrinters((prev) => prev.filter((p) => p.id !== id));
        } catch (err: any) {
            alert("Delete failed: " + (err.message || JSON.stringify(err)));
        } finally {
            setPrinterProcessingId(null);
        }
    };

    const paymentCounts = {
        all: verifications.length,
        pending: verifications.filter((v) => v.status === "pending").length,
        approved: verifications.filter((v) => v.status === "approved").length,
        rejected: verifications.filter((v) => v.status === "rejected").length,
    };

    const demoCounts = {
        all: demoRequests.length,
        pending: demoRequests.filter((d) => d.status === "pending").length,
        contacted: demoRequests.filter((d) => d.status === "contacted").length,
    };

    const displayedPayments = filter === "all"
        ? verifications
        : verifications.filter((v) => v.status === filter);

    const displayedDemos = demoFilter === "all"
        ? demoRequests
        : demoRequests.filter((d) => d.status === demoFilter);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });

    return (
        <div className="admin-wrapper">
            {/* Sticky top bar */}
            <div className="admin-topbar">
                <div className="admin-topbar-left">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        &larr;
                    </button>
                    <span className="admin-topbar-title">Arambh</span>
                    <span className="admin-topbar-badge">Admin</span>
                </div>
                <span className="admin-topbar-user">{user?.email}</span>
            </div>

            <div className="admin-content">
                <div className="admin-view-toggle" style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
                    <button
                        className={`admin-filter-btn ${currentView === "payments" ? "active" : ""}`}
                        onClick={() => setCurrentView("payments")}
                    >
                        Payment Verifications
                    </button>
                    <button
                        className={`admin-filter-btn ${currentView === "demos" ? "active" : ""}`}
                        onClick={() => setCurrentView("demos")}
                    >
                        Demo Requests
                    </button>
                    <button
                        className={`admin-filter-btn ${currentView === "printers" ? "active" : ""}`}
                        onClick={() => setCurrentView("printers")}
                    >
                        Printers
                    </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                        <h1 className="admin-page-title">
                            {currentView === "payments" && "Payment Verifications"}
                            {currentView === "demos" && "Demo Requests"}
                            {currentView === "printers" && "Recommended Printers"}
                        </h1>
                        <p className="admin-page-subtitle">
                            {currentView === "payments" && "Review and approve UPI payment submissions from users."}
                            {currentView === "demos" && "Manage demo requests from the landing page. Reach out to potential customers."}
                            {currentView === "printers" && "Manage the recommended thermal printers displayed to users."}
                        </p>
                    </div>
                    {currentView === "printers" && (
                        <button
                            className="btn-primary-solid"
                            onClick={() => setIsAddPrinterOpen(!isAddPrinterOpen)}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            {isAddPrinterOpen ? "Close Form" : "+ Add Printer"}
                        </button>
                    )}
                </div>

                {/* Add Printer Form */}
                {currentView === "printers" && isAddPrinterOpen && (
                    <div style={{ background: "var(--color-surface)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "2rem" }}>
                        <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Add New Printer</h3>
                        <form onSubmit={handleAddPrinter} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "500px" }}>
                            <input
                                type="text"
                                placeholder="Printer Name"
                                value={printerForm.name}
                                onChange={e => setPrinterForm({ ...printerForm, name: e.target.value })}
                                required className="admin-note-input" style={{ width: "100%" }}
                            />
                            <input
                                type="url"
                                placeholder="Image URL (e.g. https://...)"
                                value={printerForm.image_url}
                                onChange={e => setPrinterForm({ ...printerForm, image_url: e.target.value })}
                                required className="admin-note-input" style={{ width: "100%" }}
                            />
                            <input
                                type="url"
                                placeholder="Buy Link (e.g. Amazon URL)"
                                value={printerForm.buy_link}
                                onChange={e => setPrinterForm({ ...printerForm, buy_link: e.target.value })}
                                required className="admin-note-input" style={{ width: "100%" }}
                            />
                            <textarea
                                placeholder="Description (Max 250 words)"
                                value={printerForm.description}
                                onChange={e => setPrinterForm({ ...printerForm, description: e.target.value })}
                                required className="admin-note-input" style={{ width: "100%", resize: "vertical", minHeight: "100px", fontFamily: "inherit" }}
                            />
                            <p style={{ fontSize: "0.8rem", color: "var(--color-text-light)", margin: 0 }}>
                                Word count: {printerForm.description.trim() ? printerForm.description.trim().split(/\s+/).length : 0} / 250
                            </p>
                            <button type="submit" className="btn-primary-solid" disabled={printerSubmitStatus === "submitting"}>
                                {printerSubmitStatus === "submitting" ? "Adding..." : "Save Printer"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Stats */}
                <div className="admin-stats">
                    {currentView === "payments" ? (
                        <>
                            <div className="admin-stat-card pending">
                                <span className="admin-stat-value">{paymentCounts.pending}</span>
                                <span className="admin-stat-label">Pending</span>
                            </div>
                            <div className="admin-stat-card approved">
                                <span className="admin-stat-value">{paymentCounts.approved}</span>
                                <span className="admin-stat-label">Approved</span>
                            </div>
                            <div className="admin-stat-card rejected">
                                <span className="admin-stat-value">{paymentCounts.rejected}</span>
                                <span className="admin-stat-label">Rejected</span>
                            </div>
                        </>
                    ) : currentView === "demos" ? (
                        <>
                            <div className="admin-stat-card pending">
                                <span className="admin-stat-value">{demoCounts.pending}</span>
                                <span className="admin-stat-label">Pending</span>
                            </div>
                            <div className="admin-stat-card approved">
                                <span className="admin-stat-value">{demoCounts.contacted}</span>
                                <span className="admin-stat-label">Contacted</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="admin-stat-card">
                                <span className="admin-stat-value">{printers.length}</span>
                                <span className="admin-stat-label">Total Printers</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Filter tabs */}
                <div className="admin-filter-row">
                    {currentView === "payments" ? (
                        (["pending", "approved", "rejected", "all"] as Filter[]).map((f) => (
                            <button
                                key={f}
                                className={`admin-filter-btn${filter === f ? " active" : ""}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                {f !== "all" && ` (${paymentCounts[f]})`}
                            </button>
                        ))
                    ) : currentView === "demos" ? (
                        (["pending", "contacted", "all"] as DemoFilter[]).map((f) => (
                            <button
                                key={f}
                                className={`admin-filter-btn${demoFilter === f ? " active" : ""}`}
                                onClick={() => setDemoFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                {f !== "all" && ` (${demoCounts[f]})`}
                            </button>
                        ))
                    ) : null}
                    <button
                        className="admin-filter-btn"
                        onClick={currentView === "payments" ? fetchData : currentView === "demos" ? fetchDemoRequests : fetchPrinters}
                        style={{ marginLeft: "auto" }}
                        title="Refresh"
                    >
                        <RefreshCw size={13} style={{ display: "inline" }} /> Refresh
                    </button>
                </div>

                {/* Table */}
                <div className="admin-table-wrap">
                    {loading ? (
                        <div className="admin-loading">
                            <Loader2 size={20} className="admin-spinner" style={{ marginRight: 8 }} />
                            Loading {currentView}...
                        </div>
                    ) : (currentView === "payments" ? displayedPayments : currentView === "demos" ? displayedDemos : printers).length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">📭</div>
                            No {currentView === "payments"
                                ? (filter === "all" ? "" : filter)
                                : currentView === "demos" ? (demoFilter === "all" ? "" : demoFilter) : "printer"} records found.
                        </div>
                    ) : (
                        <table className="admin-table">
                            {currentView === "payments" ? (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Submitted</th>
                                            <th>User Info</th>
                                            <th>Plan</th>
                                            <th>Transaction ID</th>
                                            <th>Screenshot</th>
                                            <th>Status</th>
                                            <th>Note / Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedPayments.map((v) => (
                                            <tr key={v.id}>
                                                {/* Date */}
                                                <td>
                                                    <strong>{formatDate(v.created_at)}</strong>
                                                </td>

                                                {/* User info */}
                                                <td>
                                                    <strong>{v.email}</strong>
                                                    <small>📞 {v.phone}</small>
                                                    <small style={{ color: "#334155", fontSize: "0.7rem" }}>
                                                        {v.user_id.slice(0, 8)}…
                                                    </small>
                                                </td>

                                                {/* Plan */}
                                                <td>
                                                    <strong>{v.plans?.title ?? v.plan_id}</strong>
                                                    {v.plans?.total_amount && (
                                                        <small>₹{v.plans.total_amount.toLocaleString("en-IN")}</small>
                                                    )}
                                                </td>

                                                {/* Transaction ID */}
                                                <td>
                                                    <code style={{
                                                        background: "rgba(255,255,255,0.05)",
                                                        padding: "2px 6px",
                                                        borderRadius: 4,
                                                        fontSize: "0.8rem",
                                                        letterSpacing: "0.02em",
                                                    }}>
                                                        {v.transaction_id}
                                                    </code>
                                                </td>

                                                {/* Screenshot */}
                                                <td>
                                                    {v.screenshot_url ? (
                                                        <a
                                                            href={v.screenshot_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="admin-screenshot-link"
                                                        >
                                                            <ExternalLink size={13} /> View
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: "#334155" }}>—</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td>
                                                    <span className={`admin-status-badge ${v.status}`}>
                                                        {v.status}
                                                    </span>
                                                    {v.admin_note && (
                                                        <small style={{ marginTop: 4 }}>{v.admin_note}</small>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td>
                                                    {v.status === "pending" ? (
                                                        <div className="admin-actions-cell">
                                                            <input
                                                                type="text"
                                                                className="admin-note-input"
                                                                placeholder="Note (optional)"
                                                                value={notes[v.id] ?? ""}
                                                                onChange={(e) =>
                                                                    setNotes((prev) => ({
                                                                        ...prev,
                                                                        [v.id]: e.target.value,
                                                                    }))
                                                                }
                                                            />
                                                            <button
                                                                className="admin-action-btn approve"
                                                                disabled={processingId === v.id}
                                                                onClick={() => handleAction(v.id, "approve")}
                                                            >
                                                                {processingId === v.id ? (
                                                                    <Loader2 size={13} className="admin-spinner" />
                                                                ) : (
                                                                    <CheckCircle size={13} />
                                                                )}
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="admin-action-btn reject"
                                                                disabled={processingId === v.id}
                                                                onClick={() => handleAction(v.id, "reject")}
                                                            >
                                                                <XCircle size={13} /> Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: "#334155", fontSize: "0.8rem" }}>
                                                            {v.status === "approved" ? "✓ Activated" : "✗ Rejected"}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            ) : currentView === "demos" ? (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Submitted</th>
                                            <th>Name</th>
                                            <th>Contact Info</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedDemos.map((d) => (
                                            <tr key={d.id}>
                                                <td>
                                                    <strong>{formatDate(d.created_at)}</strong>
                                                </td>
                                                <td>
                                                    <strong>{d.name}</strong>
                                                    {d.request_type === "custom_pos" && (
                                                        <span style={{ display: "inline-block", marginLeft: "0.5rem", fontSize: "0.7rem", padding: "2px 6px", background: "rgba(var(--color-primary-rgb), 0.1)", color: "var(--color-primary)", border: "1px solid rgba(var(--color-primary-rgb), 0.2)", borderRadius: "12px", verticalAlign: "middle" }}>
                                                            Custom POS
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <strong>{d.phone}</strong>
                                                    {d.email && <small>✉️ {d.email}</small>}
                                                </td>
                                                <td>
                                                    <strong>{d.city}</strong>
                                                    <small>{d.state}</small>
                                                </td>
                                                <td>
                                                    <span className={`admin-status-badge ${d.status === "contacted" ? "approved" : "pending"}`}>
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {d.status === "pending" ? (
                                                        <button
                                                            className="admin-action-btn approve"
                                                            disabled={demoProcessingId === d.id}
                                                            onClick={() => handleDemoAction(d.id, "contacted")}
                                                        >
                                                            {demoProcessingId === d.id ? (
                                                                <Loader2 size={13} className="admin-spinner" />
                                                            ) : (
                                                                <CheckCircle size={13} />
                                                            )}
                                                            Mark Contacted
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: "#334155", fontSize: "0.8rem" }}>
                                                            ✓ Contacted
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            ) : currentView === "printers" ? (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Added</th>
                                            <th>Image</th>
                                            <th>Name & Description</th>
                                            <th>Link</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {printers.map((p) => (
                                            <tr key={p.id}>
                                                <td>
                                                    <strong>{formatDate(p.created_at)}</strong>
                                                </td>
                                                <td>
                                                    <img src={p.image_url} alt={p.name} style={{ width: "60px", height: "60px", objectFit: "contain", background: "#fff", borderRadius: "4px" }} />
                                                </td>
                                                <td style={{ maxWidth: "250px" }}>
                                                    <strong>{p.name}</strong>
                                                    <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--color-text-light)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                                        {p.description}
                                                    </p>
                                                </td>
                                                <td>
                                                    <a href={p.buy_link} target="_blank" rel="noopener noreferrer" className="admin-screenshot-link">
                                                        <ExternalLink size={13} /> Buy Link
                                                    </a>
                                                </td>
                                                <td>
                                                    <button
                                                        className="admin-action-btn reject"
                                                        disabled={printerProcessingId === p.id}
                                                        onClick={() => handleDeletePrinter(p.id)}
                                                    >
                                                        {printerProcessingId === p.id ? (
                                                            <Loader2 size={13} className="admin-spinner" />
                                                        ) : (
                                                            <XCircle size={13} />
                                                        )}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            ) : null}
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
