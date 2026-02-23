import { Armchair, X } from "lucide-react";
import type { Draft } from "../../../Contexts/OrderContext";

interface Table {
    id: string;
    tableNo: string;
    status: "active" | "inactive";
}

interface TableModalProps {
    isOpen: boolean;
    onClose: () => void;
    tables: Table[];
    drafts: Draft[];
    onSelectTable: (draft: Draft) => void;
}

const TableModal = ({ isOpen, onClose, tables, drafts, onSelectTable }: TableModalProps) => {
    if (!isOpen) return null;

    const activeTables = tables.filter((t) => t.status === "active");

    // Build a map: tableNo -> draft (only first match if multiple drafts for same table)
    const draftByTable: Record<string, Draft> = {};
    drafts.forEach((draft) => {
        if (draft.tableNo && !draftByTable[draft.tableNo]) {
            draftByTable[draft.tableNo] = draft;
        }
    });

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                style={{ maxWidth: "560px", width: "90%" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <h2>Tables</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                {/* Legend */}
                <div style={{ display: "flex", gap: "1.2rem", padding: "0.75rem 1.5rem", borderBottom: "1px solid var(--border-color, #e5e7eb)", fontSize: "0.8rem", color: "#6b7280" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
                        Has Draft
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#e5e7eb", display: "inline-block" }} />
                        Available
                    </span>
                </div>

                {/* Table Grid */}
                <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "1rem" }}>
                    {activeTables.length === 0 ? (
                        <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#9ca3af", padding: "2rem 0" }}>
                            No active tables found.
                        </p>
                    ) : (
                        activeTables.map((table) => {
                            const hasDraft = !!draftByTable[table.tableNo];
                            return (
                                <button
                                    key={table.id}
                                    onClick={() => {
                                        if (hasDraft) {
                                            onSelectTable(draftByTable[table.tableNo]);
                                            onClose();
                                        }
                                    }}
                                    title={hasDraft ? `Resume draft for ${table.tableNo}` : `${table.tableNo} — No draft`}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.4rem",
                                        padding: "1rem 0.5rem",
                                        borderRadius: "10px",
                                        border: hasDraft ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                                        background: hasDraft ? "#eff6ff" : "#f9fafb",
                                        cursor: hasDraft ? "pointer" : "default",
                                        transition: "all 0.2s",
                                        boxShadow: hasDraft ? "0 2px 8px rgba(59,130,246,0.15)" : "none",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (hasDraft) {
                                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(59,130,246,0.25)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                        (e.currentTarget as HTMLButtonElement).style.boxShadow = hasDraft ? "0 2px 8px rgba(59,130,246,0.15)" : "none";
                                    }}
                                >
                                    <span style={{ fontSize: "1.6rem" }}><Armchair size={32} color="#ff8800d0" /></span>
                                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: hasDraft ? "#1d4ed8" : "#374151" }}>
                                        {table.tableNo}
                                    </span>
                                    {hasDraft && (
                                        <span style={{ fontSize: "0.7rem", color: "#3b82f6", fontWeight: 600, background: "#dbeafe", padding: "1px 6px", borderRadius: "999px" }}>
                                            Draft
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default TableModal;
