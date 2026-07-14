import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { supabase } from "../../config/supabase";
import { Loader2, CheckCircle, XCircle, ExternalLink, RefreshCw, Plus, Trash2, Copy, Eye, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
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

// ── Pinterest Types ──
interface PinProduct {
    name: string;
    image_url: string;
    price: string;
    tag: "winner" | "runner_up" | "budget" | "";
    review: string;
    buy_link: string;
}

interface PinSection {
    section_title: string;
    products: PinProduct[];
}

interface PinComparisonRow {
    feature: string;
    products: Record<string, string>;
}

interface PinterestPage {
    id: string;
    slug: string;
    meta_title: string;
    meta_description: string;
    show_hero: boolean;
    show_products: boolean;
    show_comparison: boolean;
    show_email_section: boolean;
    show_footer: boolean;
    hero_title: string;
    hero_subtitle: string;
    hero_image_url: string;
    pinterest_pin_url: string;
    sections: PinSection[];
    comparison_data: PinComparisonRow[];
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

// ── Empty templates ──
const emptyProduct = (): PinProduct => ({
    name: "", image_url: "", price: "", tag: "", review: "", buy_link: ""
});

const emptySection = (): PinSection => ({
    section_title: "", products: [emptyProduct()]
});

const emptyComparisonRow = (): PinComparisonRow => ({
    feature: "", products: {}
});

const emptyPinterestPage = (): Omit<PinterestPage, "id" | "created_at" | "updated_at"> => ({
    slug: "",
    meta_title: "",
    meta_description: "",
    show_hero: true,
    show_products: true,
    show_comparison: true,
    show_email_section: true,
    show_footer: true,
    hero_title: "",
    hero_subtitle: "",
    hero_image_url: "",
    pinterest_pin_url: "",
    sections: [emptySection()],
    comparison_data: [],
    is_published: true,
});

const AdminPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("pending");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    // Demo Requests State
    const [currentView, setCurrentView] = useState<"payments" | "demos" | "printers" | "pinterest">("payments");
    const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
    const [demoFilter, setDemoFilter] = useState<DemoFilter>("pending");
    const [demoProcessingId, setDemoProcessingId] = useState<string | null>(null);

    // Printers State
    const [printers, setPrinters] = useState<RecommendedPrinter[]>([]);
    const [isAddPrinterOpen, setIsAddPrinterOpen] = useState(false);
    const [printerForm, setPrinterForm] = useState({ name: "", image_url: "", description: "", buy_link: "" });
    const [printerSubmitStatus, setPrinterSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [printerProcessingId, setPrinterProcessingId] = useState<string | null>(null);

    // ── Pinterest State ──
    const [pinPages, setPinPages] = useState<PinterestPage[]>([]);
    const [pinEditorOpen, setPinEditorOpen] = useState(false);
    const [pinEditingId, setPinEditingId] = useState<string | null>(null);
    const [pinForm, setPinForm] = useState(emptyPinterestPage());
    const [pinSubmitStatus, setPinSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [pinProcessingId, setPinProcessingId] = useState<string | null>(null);
    const [pinExpandedSections, setPinExpandedSections] = useState<Set<number>>(new Set([0]));

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

    const fetchPinPages = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("pinterest_pages")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setPinPages(data as PinterestPage[]);
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
        } else if (currentView === "pinterest") {
            fetchPinPages();
        }
    }, [currentView, fetchData, fetchDemoRequests, fetchPrinters, fetchPinPages]);

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

    // ── Pinterest Handlers ──
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .slice(0, 80);
    };

    const openPinEditor = (page?: PinterestPage) => {
        if (page) {
            setPinEditingId(page.id);
            setPinForm({
                slug: page.slug,
                meta_title: page.meta_title,
                meta_description: page.meta_description || "",
                show_hero: page.show_hero,
                show_products: page.show_products,
                show_comparison: page.show_comparison,
                show_email_section: page.show_email_section,
                show_footer: page.show_footer,
                hero_title: page.hero_title || "",
                hero_subtitle: page.hero_subtitle || "",
                hero_image_url: page.hero_image_url || "",
                pinterest_pin_url: page.pinterest_pin_url || "",
                sections: page.sections && page.sections.length > 0 ? page.sections : [emptySection()],
                comparison_data: page.comparison_data || [],
                is_published: page.is_published,
            });
        } else {
            setPinEditingId(null);
            setPinForm(emptyPinterestPage());
        }
        setPinEditorOpen(true);
        setPinSubmitStatus("idle");
        setPinExpandedSections(new Set([0]));
    };

    const closePinEditor = () => {
        setPinEditorOpen(false);
        setPinEditingId(null);
        setPinForm(emptyPinterestPage());
        setPinSubmitStatus("idle");
    };

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pinForm.slug.trim() || !pinForm.meta_title.trim()) {
            alert("Slug and Meta Title are required.");
            return;
        }

        setPinSubmitStatus("submitting");

        const payload = {
            slug: DOMPurify.sanitize(pinForm.slug.trim()),
            meta_title: DOMPurify.sanitize(pinForm.meta_title.trim()),
            meta_description: DOMPurify.sanitize(pinForm.meta_description.trim()) || null,
            show_hero: pinForm.show_hero,
            show_products: pinForm.show_products,
            show_comparison: pinForm.show_comparison,
            show_email_section: pinForm.show_email_section,
            show_footer: pinForm.show_footer,
            hero_title: DOMPurify.sanitize(pinForm.hero_title.trim()) || null,
            hero_subtitle: DOMPurify.sanitize(pinForm.hero_subtitle.trim()) || null,
            hero_image_url: pinForm.hero_image_url.trim() || null,
            pinterest_pin_url: pinForm.pinterest_pin_url.trim() || null,
            sections: pinForm.sections,
            comparison_data: pinForm.comparison_data,
            is_published: pinForm.is_published,
            updated_at: new Date().toISOString(),
        };

        try {
            if (pinEditingId) {
                const { error } = await supabase
                    .from("pinterest_pages")
                    .update(payload)
                    .eq("id", pinEditingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("pinterest_pages")
                    .insert([payload]);
                if (error) throw error;
            }

            setPinSubmitStatus("success");
            closePinEditor();
            fetchPinPages();
        } catch (err: any) {
            console.error("Pinterest save failed:", err);
            setPinSubmitStatus("error");
            alert("Save failed: " + (err.message || JSON.stringify(err)));
        }
    };

    const handlePinDelete = async (id: string) => {
        if (!window.confirm("Delete this Pinterest page? This cannot be undone.")) return;
        setPinProcessingId(id);

        try {
            const { error } = await supabase.from("pinterest_pages").delete().eq("id", id);
            if (error) throw error;
            setPinPages((prev) => prev.filter((p) => p.id !== id));
        } catch (err: any) {
            alert("Delete failed: " + (err.message || JSON.stringify(err)));
        } finally {
            setPinProcessingId(null);
        }
    };

    const handlePinDuplicate = async (page: PinterestPage) => {
        setPinProcessingId(page.id);
        try {
            const { error } = await supabase.from("pinterest_pages").insert([{
                slug: page.slug + "-copy-" + Date.now().toString(36),
                meta_title: page.meta_title + " (Copy)",
                meta_description: page.meta_description,
                show_hero: page.show_hero,
                show_products: page.show_products,
                show_comparison: page.show_comparison,
                show_email_section: page.show_email_section,
                show_footer: page.show_footer,
                hero_title: page.hero_title,
                hero_subtitle: page.hero_subtitle,
                hero_image_url: page.hero_image_url,
                pinterest_pin_url: page.pinterest_pin_url,
                sections: page.sections,
                comparison_data: page.comparison_data,
                is_published: false,
            }]);
            if (error) throw error;
            fetchPinPages();
        } catch (err: any) {
            alert("Duplicate failed: " + (err.message || JSON.stringify(err)));
        } finally {
            setPinProcessingId(null);
        }
    };

    // ── Pinterest form helpers ──
    const updateSection = (idx: number, field: keyof PinSection, value: any) => {
        const updated = [...pinForm.sections];
        (updated[idx] as any)[field] = value;
        setPinForm({ ...pinForm, sections: updated });
    };

    const addSection = () => {
        const newSections = [...pinForm.sections, emptySection()];
        setPinForm({ ...pinForm, sections: newSections });
        setPinExpandedSections(new Set([...pinExpandedSections, newSections.length - 1]));
    };

    const removeSection = (idx: number) => {
        if (pinForm.sections.length <= 1) return;
        const updated = pinForm.sections.filter((_, i) => i !== idx);
        setPinForm({ ...pinForm, sections: updated });
    };

    const updateProduct = (sIdx: number, pIdx: number, field: keyof PinProduct, value: string) => {
        const updated = [...pinForm.sections];
        (updated[sIdx].products[pIdx] as any)[field] = value;
        setPinForm({ ...pinForm, sections: updated });
    };

    const addProduct = (sIdx: number) => {
        const updated = [...pinForm.sections];
        updated[sIdx].products.push(emptyProduct());
        setPinForm({ ...pinForm, sections: updated });
    };

    const removeProduct = (sIdx: number, pIdx: number) => {
        if (pinForm.sections[sIdx].products.length <= 1) return;
        const updated = [...pinForm.sections];
        updated[sIdx].products = updated[sIdx].products.filter((_, i) => i !== pIdx);
        setPinForm({ ...pinForm, sections: updated });
    };

    const addComparisonRow = () => {
        setPinForm({
            ...pinForm,
            comparison_data: [...pinForm.comparison_data, emptyComparisonRow()]
        });
    };

    const removeComparisonRow = (idx: number) => {
        setPinForm({
            ...pinForm,
            comparison_data: pinForm.comparison_data.filter((_, i) => i !== idx)
        });
    };

    const updateComparisonRow = (idx: number, field: "feature", value: string) => {
        const updated = [...pinForm.comparison_data];
        updated[idx][field] = value;
        setPinForm({ ...pinForm, comparison_data: updated });
    };

    const updateComparisonProduct = (rowIdx: number, productName: string, value: string) => {
        const updated = [...pinForm.comparison_data];
        updated[rowIdx].products = { ...updated[rowIdx].products, [productName]: value };
        setPinForm({ ...pinForm, comparison_data: updated });
    };

    // Get all product names from sections for comparison table
    const allProductNamesFromSections = (): string[] => {
        const names = new Set<string>();
        pinForm.sections.forEach((s) => {
            s.products.forEach((p) => {
                if (p.name.trim()) names.add(p.name.trim());
            });
        });
        return Array.from(names);
    };

    const toggleSectionExpanded = (idx: number) => {
        const newSet = new Set(pinExpandedSections);
        if (newSet.has(idx)) {
            newSet.delete(idx);
        } else {
            newSet.add(idx);
        }
        setPinExpandedSections(newSet);
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
                <div className="admin-view-toggle" style={{ marginBottom: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
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
                    <button
                        className={`admin-filter-btn ${currentView === "pinterest" ? "active" : ""}`}
                        onClick={() => setCurrentView("pinterest")}
                    >
                        Pinterest Pages
                    </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                        <h1 className="admin-page-title">
                            {currentView === "payments" && "Payment Verifications"}
                            {currentView === "demos" && "Demo Requests"}
                            {currentView === "printers" && "Recommended Printers"}
                            {currentView === "pinterest" && "Pinterest Pages"}
                        </h1>
                        <p className="admin-page-subtitle">
                            {currentView === "payments" && "Review and approve UPI payment submissions from users."}
                            {currentView === "demos" && "Manage demo requests from the landing page. Reach out to potential customers."}
                            {currentView === "printers" && "Manage the recommended thermal printers displayed to users."}
                            {currentView === "pinterest" && "Create and manage Pinterest landing pages. Each page is instantly live at /pin/slug."}
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
                    {currentView === "pinterest" && (
                        <button
                            className="btn-primary-solid"
                            onClick={() => openPinEditor()}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Create Page
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

                {/* ── Pinterest Editor ── */}
                {currentView === "pinterest" && pinEditorOpen && (
                    <div className="pin-editor-panel">
                        <div className="pin-editor-header">
                            <h3>{pinEditingId ? "Edit Pinterest Page" : "Create New Pinterest Page"}</h3>
                            <button className="admin-action-btn reject" onClick={closePinEditor}>
                                <XCircle size={13} /> Close
                            </button>
                        </div>

                        <form onSubmit={handlePinSubmit} className="pin-editor-form">
                            {/* Basic Info */}
                            <div className="pin-editor-group">
                                <h4>Basic Info</h4>
                                <div className="pin-editor-row">
                                    <div className="pin-editor-field">
                                        <label>Meta Title *</label>
                                        <input
                                            type="text" required
                                            placeholder="e.g. Best Thermal Printers 2026"
                                            value={pinForm.meta_title}
                                            onChange={(e) => {
                                                setPinForm({ ...pinForm, meta_title: e.target.value });
                                                if (!pinEditingId && !pinForm.slug) {
                                                    setPinForm(prev => ({ ...prev, meta_title: e.target.value, slug: generateSlug(e.target.value) }));
                                                }
                                            }}
                                            className="admin-note-input"
                                        />
                                    </div>
                                    <div className="pin-editor-field">
                                        <label>URL Slug *</label>
                                        <input
                                            type="text" required
                                            placeholder="best-thermal-printers"
                                            value={pinForm.slug}
                                            onChange={(e) => setPinForm({ ...pinForm, slug: generateSlug(e.target.value) })}
                                            className="admin-note-input"
                                        />
                                        <small style={{ color: "#64748b" }}>Live at: /pin/{pinForm.slug || "..."}</small>
                                    </div>
                                </div>
                                <div className="pin-editor-field">
                                    <label>Meta Description</label>
                                    <textarea
                                        placeholder="SEO description for search engines"
                                        value={pinForm.meta_description}
                                        onChange={(e) => setPinForm({ ...pinForm, meta_description: e.target.value })}
                                        className="admin-note-input"
                                        style={{ resize: "vertical", minHeight: "60px", fontFamily: "inherit" }}
                                    />
                                </div>
                                <div className="pin-editor-field">
                                    <label>Pinterest Pin URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://pin.it/..."
                                        value={pinForm.pinterest_pin_url}
                                        onChange={(e) => setPinForm({ ...pinForm, pinterest_pin_url: e.target.value })}
                                        className="admin-note-input"
                                    />
                                </div>
                            </div>

                            {/* Section Toggles */}
                            <div className="pin-editor-group">
                                <h4>Section Visibility</h4>
                                <div className="pin-toggle-grid">
                                    {([
                                        ["show_hero", "Hero Section"],
                                        ["show_products", "Product Sections"],
                                        ["show_comparison", "Comparison Table"],
                                        ["show_email_section", "Email Section"],
                                        ["show_footer", "Footer"],
                                    ] as [keyof typeof pinForm, string][]).map(([key, label]) => (
                                        <label key={key} className="pin-toggle-item">
                                            <input
                                                type="checkbox"
                                                checked={pinForm[key] as boolean}
                                                onChange={(e) => setPinForm({ ...pinForm, [key]: e.target.checked })}
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                    <label className="pin-toggle-item">
                                        <input
                                            type="checkbox"
                                            checked={pinForm.is_published}
                                            onChange={(e) => setPinForm({ ...pinForm, is_published: e.target.checked })}
                                        />
                                        <span style={{ color: pinForm.is_published ? "#22c55e" : "#ef4444" }}>
                                            {pinForm.is_published ? "Published" : "Draft"}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Hero Section */}
                            {pinForm.show_hero && (
                                <div className="pin-editor-group">
                                    <h4>Hero Section</h4>
                                    <div className="pin-editor-row">
                                        <div className="pin-editor-field">
                                            <label>Hero Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Best Thermal Printers for 2026"
                                                value={pinForm.hero_title}
                                                onChange={(e) => setPinForm({ ...pinForm, hero_title: e.target.value })}
                                                className="admin-note-input"
                                            />
                                        </div>
                                        <div className="pin-editor-field">
                                            <label>Hero Image URL</label>
                                            <input
                                                type="url"
                                                placeholder="https://..."
                                                value={pinForm.hero_image_url}
                                                onChange={(e) => setPinForm({ ...pinForm, hero_image_url: e.target.value })}
                                                className="admin-note-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="pin-editor-field">
                                        <label>Hero Subtitle</label>
                                        <textarea
                                            placeholder="A brief description under the hero title"
                                            value={pinForm.hero_subtitle}
                                            onChange={(e) => setPinForm({ ...pinForm, hero_subtitle: e.target.value })}
                                            className="admin-note-input"
                                            style={{ resize: "vertical", minHeight: "60px", fontFamily: "inherit" }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Product Sections */}
                            {pinForm.show_products && (
                                <div className="pin-editor-group">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h4>Product Sections ({pinForm.sections.length})</h4>
                                        <button type="button" className="admin-action-btn approve" onClick={addSection}>
                                            <Plus size={13} /> Add Section
                                        </button>
                                    </div>

                                    {pinForm.sections.map((section, sIdx) => (
                                        <div key={sIdx} className="pin-section-editor">
                                            <div className="pin-section-editor-header" onClick={() => toggleSectionExpanded(sIdx)}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <GripVertical size={14} style={{ color: "#475569" }} />
                                                    <span style={{ fontWeight: 600 }}>
                                                        {section.section_title || `Section ${sIdx + 1}`}
                                                    </span>
                                                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                                        ({section.products.length} product{section.products.length !== 1 ? "s" : ""})
                                                    </span>
                                                </div>
                                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                    {pinForm.sections.length > 1 && (
                                                        <button type="button" className="admin-action-btn reject" onClick={(e) => { e.stopPropagation(); removeSection(sIdx); }} style={{ padding: "0.2rem 0.5rem" }}>
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                    {pinExpandedSections.has(sIdx) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </div>
                                            </div>

                                            {pinExpandedSections.has(sIdx) && (
                                                <div className="pin-section-editor-body">
                                                    <div className="pin-editor-field">
                                                        <label>Section Title</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Best Thermal Printers for Restaurants"
                                                            value={section.section_title}
                                                            onChange={(e) => updateSection(sIdx, "section_title", e.target.value)}
                                                            className="admin-note-input"
                                                        />
                                                    </div>

                                                    {section.products.map((product, pIdx) => (
                                                        <div key={pIdx} className="pin-product-editor">
                                                            <div className="pin-product-editor-header">
                                                                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                                                    {product.name || `Product ${pIdx + 1}`}
                                                                </span>
                                                                {section.products.length > 1 && (
                                                                    <button type="button" className="admin-action-btn reject" onClick={() => removeProduct(sIdx, pIdx)} style={{ padding: "0.2rem 0.5rem" }}>
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="pin-editor-row">
                                                                <div className="pin-editor-field">
                                                                    <label>Product Name *</label>
                                                                    <input
                                                                        type="text" required
                                                                        placeholder="e.g. Retsol RTP-80"
                                                                        value={product.name}
                                                                        onChange={(e) => updateProduct(sIdx, pIdx, "name", e.target.value)}
                                                                        className="admin-note-input"
                                                                    />
                                                                </div>
                                                                <div className="pin-editor-field">
                                                                    <label>Price *</label>
                                                                    <input
                                                                        type="text" required
                                                                        placeholder="e.g. ₹4,500"
                                                                        value={product.price}
                                                                        onChange={(e) => updateProduct(sIdx, pIdx, "price", e.target.value)}
                                                                        className="admin-note-input"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="pin-editor-row">
                                                                <div className="pin-editor-field">
                                                                    <label>Image URL</label>
                                                                    <input
                                                                        type="url"
                                                                        placeholder="https://..."
                                                                        value={product.image_url}
                                                                        onChange={(e) => updateProduct(sIdx, pIdx, "image_url", e.target.value)}
                                                                        className="admin-note-input"
                                                                    />
                                                                </div>
                                                                <div className="pin-editor-field">
                                                                    <label>Tag</label>
                                                                    <select
                                                                        value={product.tag}
                                                                        onChange={(e) => updateProduct(sIdx, pIdx, "tag", e.target.value)}
                                                                        className="admin-note-input"
                                                                    >
                                                                        <option value="">None</option>
                                                                        <option value="winner">🏆 Winner</option>
                                                                        <option value="runner_up">🥈 Runner-up</option>
                                                                        <option value="budget">💰 Budget Pick</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="pin-editor-field">
                                                                <label>Review (max 2 lines)</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. Great for small cafes, fast printing speed"
                                                                    value={product.review}
                                                                    onChange={(e) => updateProduct(sIdx, pIdx, "review", e.target.value)}
                                                                    className="admin-note-input"
                                                                    maxLength={150}
                                                                />
                                                            </div>
                                                            <div className="pin-editor-field">
                                                                <label>Amazon Buy Link *</label>
                                                                <input
                                                                    type="url" required
                                                                    placeholder="https://amazon.in/..."
                                                                    value={product.buy_link}
                                                                    onChange={(e) => updateProduct(sIdx, pIdx, "buy_link", e.target.value)}
                                                                    className="admin-note-input"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <button type="button" className="admin-action-btn approve" onClick={() => addProduct(sIdx)} style={{ marginTop: "0.5rem" }}>
                                                        <Plus size={13} /> Add Product
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Comparison Table */}
                            {pinForm.show_comparison && (
                                <div className="pin-editor-group">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h4>Comparison Table</h4>
                                        <button type="button" className="admin-action-btn approve" onClick={addComparisonRow}>
                                            <Plus size={13} /> Add Row
                                        </button>
                                    </div>

                                    {allProductNamesFromSections().length === 0 && (
                                        <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                                            Add products above first. Product names will appear as columns here.
                                        </p>
                                    )}

                                    {pinForm.comparison_data.length > 0 && allProductNamesFromSections().length > 0 && (
                                        <div style={{ overflowX: "auto" }}>
                                            <table className="admin-table" style={{ minWidth: "auto" }}>
                                                <thead>
                                                    <tr>
                                                        <th>Feature</th>
                                                        {allProductNamesFromSections().map((name) => (
                                                            <th key={name}>{name}</th>
                                                        ))}
                                                        <th style={{ width: "50px" }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pinForm.comparison_data.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. Print Speed"
                                                                    value={row.feature}
                                                                    onChange={(e) => updateComparisonRow(idx, "feature", e.target.value)}
                                                                    className="admin-note-input"
                                                                    style={{ width: "100%" }}
                                                                />
                                                            </td>
                                                            {allProductNamesFromSections().map((name) => (
                                                                <td key={name}>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="—"
                                                                        value={row.products?.[name] || ""}
                                                                        onChange={(e) => updateComparisonProduct(idx, name, e.target.value)}
                                                                        className="admin-note-input"
                                                                        style={{ width: "100%" }}
                                                                    />
                                                                </td>
                                                            ))}
                                                            <td>
                                                                <button type="button" className="admin-action-btn reject" onClick={() => removeComparisonRow(idx)} style={{ padding: "0.2rem 0.5rem" }}>
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit */}
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                <button type="button" className="admin-filter-btn" onClick={closePinEditor}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary-solid" disabled={pinSubmitStatus === "submitting"}>
                                    {pinSubmitStatus === "submitting" ? (
                                        <><Loader2 size={14} className="admin-spinner" /> Saving...</>
                                    ) : (
                                        pinEditingId ? "Update Page" : "Create Page"
                                    )}
                                </button>
                            </div>
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
                    ) : currentView === "pinterest" ? (
                        <>
                            <div className="admin-stat-card">
                                <span className="admin-stat-value">{pinPages.length}</span>
                                <span className="admin-stat-label">Total Pages</span>
                            </div>
                            <div className="admin-stat-card approved">
                                <span className="admin-stat-value">{pinPages.filter(p => p.is_published).length}</span>
                                <span className="admin-stat-label">Published</span>
                            </div>
                            <div className="admin-stat-card pending">
                                <span className="admin-stat-value">{pinPages.filter(p => !p.is_published).length}</span>
                                <span className="admin-stat-label">Drafts</span>
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
                        onClick={currentView === "payments" ? fetchData : currentView === "demos" ? fetchDemoRequests : currentView === "pinterest" ? fetchPinPages : fetchPrinters}
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
                    ) : (currentView === "payments" ? displayedPayments : currentView === "demos" ? displayedDemos : currentView === "pinterest" ? pinPages : printers).length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">📭</div>
                            No {currentView === "payments"
                                ? (filter === "all" ? "" : filter)
                                : currentView === "demos" ? (demoFilter === "all" ? "" : demoFilter) : currentView === "pinterest" ? "pinterest" : "printer"} records found.
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
                            ) : currentView === "pinterest" ? (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Created</th>
                                            <th>Title / Slug</th>
                                            <th>Sections</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pinPages.map((p) => (
                                            <tr key={p.id}>
                                                <td>
                                                    <strong>{formatDate(p.created_at)}</strong>
                                                </td>
                                                <td style={{ maxWidth: "250px" }}>
                                                    <strong>{p.meta_title}</strong>
                                                    <small>/pin/{p.slug}</small>
                                                </td>
                                                <td>
                                                    <small>
                                                        {p.sections?.length || 0} section{(p.sections?.length || 0) !== 1 ? "s" : ""}
                                                        {" · "}
                                                        {p.sections?.reduce((acc, s) => acc + (s.products?.length || 0), 0) || 0} product{(p.sections?.reduce((acc, s) => acc + (s.products?.length || 0), 0) || 0) !== 1 ? "s" : ""}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className={`admin-status-badge ${p.is_published ? "approved" : "pending"}`}>
                                                        {p.is_published ? "Published" : "Draft"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="admin-actions-cell" style={{ flexWrap: "wrap" }}>
                                                        <a
                                                            href={`/pin/${p.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="admin-action-btn approve"
                                                            style={{ textDecoration: "none" }}
                                                        >
                                                            <Eye size={13} /> Preview
                                                        </a>
                                                        <button className="admin-action-btn approve" onClick={() => openPinEditor(p)}>
                                                            <CheckCircle size={13} /> Edit
                                                        </button>
                                                        <button
                                                            className="admin-action-btn approve"
                                                            onClick={() => handlePinDuplicate(p)}
                                                            disabled={pinProcessingId === p.id}
                                                        >
                                                            {pinProcessingId === p.id ? <Loader2 size={13} className="admin-spinner" /> : <Copy size={13} />} Duplicate
                                                        </button>
                                                        <button
                                                            className="admin-action-btn reject"
                                                            onClick={() => handlePinDelete(p.id)}
                                                            disabled={pinProcessingId === p.id}
                                                        >
                                                            {pinProcessingId === p.id ? <Loader2 size={13} className="admin-spinner" /> : <XCircle size={13} />} Delete
                                                        </button>
                                                    </div>
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
