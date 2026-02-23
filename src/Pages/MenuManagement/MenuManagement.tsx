import { useState } from "react";
import { Plus, Edit2, Trash2, Ban, CheckCircle } from "lucide-react";
import { useMenu, type Category, type MenuItem } from "../../Contexts/MenuContext";
import { useToast } from "../../Contexts/ToastContext";
import CategoryModal from "./Components/CategoryModal";
import ItemModal from "./Components/ItemModal";
import ConfirmDialog from "../../Components/ConfirmDialog/ConfirmDialog";
import "./MenuManagement.css";

const MenuManagement = () => {
    const {
        categories,
        menuItems,
        deleteMenuItem,
        toggleMenuItemStatus,
        addCategory
    } = useMenu();
    const { showWarning } = useToast();

    // UI State
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");

    // Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);

    // Confirm delete state
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    // Filter Logic
    const filteredItems = selectedCategoryId === "ALL"
        ? menuItems
        : menuItems.filter(item => item.categoryId === selectedCategoryId);

    // Handlers
    const handleAddCategory = () => {
        setCategoryToEdit(null);
        setIsCategoryModalOpen(true);
    };

    const handleEditCategory = (category: Category, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent filter selection
        setCategoryToEdit(category);
        setIsCategoryModalOpen(true);
    };

    const handleAddItem = () => {
        if (categories.length === 0) {
            showWarning("Please create at least one category before adding items.");
            return;
        }
        setItemToEdit(null);
        setIsItemModalOpen(true);
    };

    const handleEditItem = (item: MenuItem) => {
        setItemToEdit(item);
        setIsItemModalOpen(true);
    };

    const handleDeleteItem = (id: string) => {
        setPendingDeleteId(id);
    };

    const handleConfirmDelete = () => {
        if (pendingDeleteId) {
            deleteMenuItem(pendingDeleteId);
            setPendingDeleteId(null);
        }
    };

    // Suggested Categories for Empty State
    const suggestedCategories = ["Appetizers", "Main Course", "Beverages", "Desserts", "Specials"];

    return (
        <div className="menu-management-container">
            {/* Header */}
            <header className="menu-header">
                <h1>Menu Management</h1>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={handleAddCategory}>
                        <Plus size={18} /> Add Category
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleAddItem}
                        disabled={categories.length === 0}
                    >
                        <Plus size={18} /> Add New Item
                    </button>
                </div>
            </header>

            {/* Empty State / Main Content */}
            {categories.length === 0 ? (
                <div className="empty-state">
                    <h3>No Menu Items Yet</h3>
                    <p>Start by creating categories to organize your menu.</p>
                    <div className="suggested-categories">
                        {suggestedCategories.map(cat => (
                            <button
                                key={cat}
                                className="category-chip"
                                onClick={() => addCategory(cat)}
                            >
                                + {cat}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Category Filter */}
                    <section className="category-section">
                        <div className="category-list">
                            <button
                                className={`category-chip ${selectedCategoryId === "ALL" ? "active" : ""}`}
                                onClick={() => setSelectedCategoryId("ALL")}
                            >
                                All Items
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`category-chip ${selectedCategoryId === cat.id ? "active" : ""} ${!cat.isActive ? "opacity-50" : ""}`}
                                    onClick={() => setSelectedCategoryId(cat.id)}
                                >
                                    {cat.name}
                                    {!cat.isActive && " (Inactive)"}
                                    <span
                                        className="edit-icon"
                                        onClick={(e) => handleEditCategory(cat, e)}
                                    >
                                        <Edit2 size={14} />
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Items Grid */}
                    <section className="menu-items-grid">
                        {filteredItems.length === 0 ? (
                            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--color-text-light)" }}>
                                No items found in this category.
                            </div>
                        ) : (
                            filteredItems.map(item => {
                                const categoryName = categories.find(c => c.id === item.categoryId)?.name || "Unknown";
                                return (
                                    <div key={item.id} className="menu-item-card">
                                        <div className="item-info">
                                            <h3>{item.name}</h3>
                                            <div className="item-price">₹{item.price.toFixed(2)}</div>
                                            <div className="item-category">{categoryName}</div>
                                            <span className={`item-status ${item.isActive ? "active" : "inactive"}`}>
                                                {item.isActive ? "Active" : "Disabled"}
                                            </span>
                                        </div>
                                        <div className="item-actions">
                                            <button
                                                className="action-btn"
                                                onClick={() => handleEditItem(item)}
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={() => toggleMenuItemStatus(item.id)}
                                                title={item.isActive ? "Disable" : "Enable"}
                                            >
                                                {item.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDeleteItem(item.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </section>
                </>
            )}

            {/* Modals */}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categoryToEdit={categoryToEdit}
            />

            <ItemModal
                isOpen={isItemModalOpen}
                onClose={() => setIsItemModalOpen(false)}
                itemToEdit={itemToEdit}
            />

            <ConfirmDialog
                isOpen={pendingDeleteId !== null}
                title="Delete Menu Item?"
                message="This item will be permanently deleted and cannot be recovered."
                confirmLabel="Delete"
                onConfirm={handleConfirmDelete}
                onCancel={() => setPendingDeleteId(null)}
            />
        </div>
    );
};

export default MenuManagement;
