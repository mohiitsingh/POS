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

type Filter = "all" | "pending" | "approved" | "rejected";

const AdminPage = () => {
    const { user } = useAuth();
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("pending");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

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

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    const counts = {
        all: verifications.length,
        pending: verifications.filter((v) => v.status === "pending").length,
        approved: verifications.filter((v) => v.status === "approved").length,
        rejected: verifications.filter((v) => v.status === "rejected").length,
    };

    const displayed = filter === "all"
        ? verifications
        : verifications.filter((v) => v.status === filter);

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
                <h1 className="admin-page-title">Payment Verifications</h1>
                <p className="admin-page-subtitle">
                    Review and approve UPI payment submissions from users.
                </p>

                {/* Stats */}
                <div className="admin-stats">
                    <div className="admin-stat-card pending">
                        <span className="admin-stat-value">{counts.pending}</span>
                        <span className="admin-stat-label">Pending</span>
                    </div>
                    <div className="admin-stat-card approved">
                        <span className="admin-stat-value">{counts.approved}</span>
                        <span className="admin-stat-label">Approved</span>
                    </div>
                    <div className="admin-stat-card rejected">
                        <span className="admin-stat-value">{counts.rejected}</span>
                        <span className="admin-stat-label">Rejected</span>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="admin-filter-row">
                    {(["pending", "approved", "rejected", "all"] as Filter[]).map((f) => (
                        <button
                            key={f}
                            className={`admin-filter-btn${filter === f ? " active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            {f !== "all" && ` (${counts[f]})`}
                        </button>
                    ))}
                    <button
                        className="admin-filter-btn"
                        onClick={fetchData}
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
                            Loading verifications…
                        </div>
                    ) : displayed.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">📭</div>
                            No {filter === "all" ? "" : filter} submissions yet.
                        </div>
                    ) : (
                        <table className="admin-table">
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
                                {displayed.map((v) => (
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
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
