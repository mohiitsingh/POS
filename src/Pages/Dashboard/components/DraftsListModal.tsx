import { useState } from "react";
import { X, Play, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Draft } from "../../../Contexts/OrderContext";
import ConfirmDialog from "../../../Components/ConfirmDialog/ConfirmDialog";

interface DraftsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    drafts: Draft[];
    onResume: (draft: Draft) => void;
    onDelete: (id: string) => void;
}

const DraftsListModal = ({ isOpen, onClose, drafts, onResume, onDelete }: DraftsListModalProps) => {
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDeleteClick = (id: string) => {
        setPendingDeleteId(id);
    };

    const handleConfirmDelete = () => {
        if (pendingDeleteId) {
            onDelete(pendingDeleteId);
            setPendingDeleteId(null);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content draft-modal-content" >
                <div className="modal-header">
                    <h2>Draft Orders ({drafts.length})</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="drafts-list-container">
                    {drafts.length === 0 ? (
                        <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                            <p>No saved drafts found.</p>
                        </div>
                    ) : (
                        <table className="orders-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Draft ID</th>
                                    <th>Saved Time</th>
                                    <th>Table</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drafts.map(draft => (
                                    <tr key={draft.id}>
                                        <td className="order-id">#{draft.id.slice(0, 8).toUpperCase()}</td>
                                        <td>{format(parseISO(draft.createdAt), "dd MMM, hh:mm a")}</td>
                                        <td>{draft.tableNo ? <span style={{ fontWeight: 600, color: '#3b82f6' }}>{draft.tableNo}</span> : <span style={{ color: '#9ca3af' }}>—</span>}</td>
                                        <td>{draft.items.length}</td>
                                        <td className="amount-cell">₹{draft.total.toFixed(2)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn-resume"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                    onClick={() => onResume(draft)}
                                                >
                                                    <Play size={14} style={{ marginRight: '4px' }} />
                                                </button>
                                                <button
                                                    className="remove-btn"
                                                    onClick={() => handleDeleteClick(draft.id)}
                                                >
                                                    <Trash2 size={16} color="#ef4444" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={pendingDeleteId !== null}
                title="Delete Draft?"
                message="This draft will be permanently removed and cannot be recovered."
                confirmLabel="Delete"
                onConfirm={handleConfirmDelete}
                onCancel={() => setPendingDeleteId(null)}
            />
        </div>
    );
};

export default DraftsListModal;
