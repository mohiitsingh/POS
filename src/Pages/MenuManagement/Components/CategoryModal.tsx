import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { useMenu, type Category } from "../../../Contexts/MenuContext";
import { useToast } from "../../../Contexts/ToastContext";
import ConfirmDialog from "../../../Components/ConfirmDialog/ConfirmDialog";
import DOMPurify from "dompurify";

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryToEdit?: Category | null;
}

const CategoryModal = ({ isOpen, onClose, categoryToEdit }: CategoryModalProps) => {
    const { addCategory, updateCategory, toggleCategoryStatus, deleteCategory, categories } = useMenu();
    const { showError } = useToast();
    const [name, setName] = useState("");
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (categoryToEdit) {
            setName(categoryToEdit.name);
            setIsActive(categoryToEdit.isActive);
        } else {
            setName("");
            setIsActive(true);
        }
    }, [categoryToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const sanitizedName = DOMPurify.sanitize(name.trim());
        if (!sanitizedName) return;

        // Check for duplicate name
        const normalizedName = sanitizedName.toLowerCase();
        const duplicate = categories.find(cat =>
            cat.name.toLowerCase() === normalizedName &&
            (!categoryToEdit || cat.id !== categoryToEdit.id)
        );

        if (duplicate) {
            showError("A category with this name already exists.");
            return;
        }

        if (categoryToEdit) {
            updateCategory(categoryToEdit.id, sanitizedName);
            // Sync status if it changed (optimization: only if different)
            if (categoryToEdit.isActive !== isActive) {
                toggleCategoryStatus(categoryToEdit.id);
            }
        } else {
            addCategory(sanitizedName);
        }
        onClose();
    };

    const handleDelete = () => {
        if (!categoryToEdit) return;
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToEdit) return;
        setConfirmDeleteOpen(false);
        const success = await deleteCategory(categoryToEdit.id);
        if (success) {
            onClose();
        } else {
            showError("Cannot delete category because it contains items. Please move or delete the items first.");
        }
    };

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>{categoryToEdit ? "Edit Category" : "Add New Category"}</h2>
                        <button onClick={onClose} className="close-btn">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="categoryName">Category Name</label>
                            <input
                                id="categoryName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-input"
                                placeholder="e.g. Appetizers"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <span>Active</span>
                            </label>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-secondary">
                                Cancel
                            </button>
                            {categoryToEdit && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="btn-secondary"
                                    style={{ color: '#ef4444', borderColor: '#ef4444', marginRight: 'auto' }}
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            )}
                            <button type="submit" className="btn-primary">
                                Save Category
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmDeleteOpen}
                title={`Delete "${categoryToEdit?.name}"?`}
                message="This category will be permanently deleted. Items in this category must be removed first."
                confirmLabel="Delete"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDeleteOpen(false)}
            />
        </>
    );
};

export default CategoryModal;

