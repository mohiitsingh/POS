import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { supabase } from "../../config/supabase";
import { Loader2, CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react";
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
    status: "pending" | "contacted";
    created_at: string;
}

type Filter = "all" | "pending" | "approved" | "rejected";
type DemoFilter = "all" | "pending" | "contacted";

const AdminPage = () => {
    const { user } = useAuth();
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("pending");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    // Demo Requests State
    const [currentView, setCurrentView] = useState<"payments" | "demos">("payments");
    const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
    const [demoFilter, setDemoFilter] = useState<DemoFilter>("pending");
    const [demoProcessingId, setDemoProcessingId] = useState<string | null>(null);

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

    useEffect(() => {
        if (currentView === "payments") {
            fetchData();
        } else {
            fetchDemoRequests();
        }
    }, [currentView, fetchData, fetchDemoRequests]);

    const handleAction = async (verificationId: string, action: "approve" | "reject") => {
        if (processingId) return;
        setProcessingId(verificationId);

        try {
            const { data, error } = await supabase.functions.invoke("admin-approve-payment", {
                body: {
                    verification_id: verificationId,
                    action,
                    admin_note: notes[verificationId] || null,
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
                </div>

                <h1 className="admin-page-title">
                    {currentView === "payments" ? "Payment Verifications" : "Demo Requests"}
                </h1>
                <p className="admin-page-subtitle">
                    {currentView === "payments" 
                        ? "Review and approve UPI payment submissions from users."
                        : "Manage demo requests from the landing page. Reach out to potential customers."}
                </p>

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
                    ) : (
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
                    ) : (
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
                    )}
                    <button
                        className="admin-filter-btn"
                        onClick={currentView === "payments" ? fetchData : fetchDemoRequests}
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
                    ) : (currentView === "payments" ? displayedPayments : displayedDemos).length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">📭</div>
                            No {currentView === "payments" 
                                ? (filter === "all" ? "" : filter) 
                                : (demoFilter === "all" ? "" : demoFilter)} records found.
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
                            ) : (
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
                            )}
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
