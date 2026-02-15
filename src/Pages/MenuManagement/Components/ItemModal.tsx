import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useMenu, type MenuItem } from "../../../Contexts/MenuContext";

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemToEdit?: MenuItem | null;
}

const ItemModal = ({ isOpen, onClose, itemToEdit }: ItemModalProps) => {
    const { addMenuItem, updateMenuItem, categories } = useMenu();

    // Form State
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [isVeg, setIsVeg] = useState(true);

    // Filter only active categories for selection, unless editing an item in an inactive category
    const activeCategories = categories.filter(c => c.isActive || (itemToEdit && itemToEdit.categoryId === c.id));

    useEffect(() => {
        if (itemToEdit) {
            setName(itemToEdit.name);
            setPrice(itemToEdit.price.toString());
            setCategoryId(itemToEdit.categoryId);
            setDescription(itemToEdit.description || "");
            setIsVeg(itemToEdit.isVeg ?? true);
        } else {
            // Reset form
            setName("");
            setPrice("");
            setCategoryId(activeCategories.length > 0 ? activeCategories[0].id : "");
            setDescription("");
            setIsVeg(true);
        }
    }, [itemToEdit, isOpen, categories]); // Added categories to dep to auto-select if needed

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !price || !categoryId) return;

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) return;

        const payload = {
            name,
            price: priceNum,
            categoryId,
            description,
            isVeg
        };

        if (itemToEdit) {
            updateMenuItem(itemToEdit.id, payload);
        } else {
            addMenuItem(payload);
        }
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{itemToEdit ? "Edit Menu Item" : "Add New Menu Item"}</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="itemName">Item Name</label>
                        <input
                            id="itemName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemPrice">Price (₹)</label>
                        <input
                            id="itemPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemCategory">Category</label>
                        <select
                            id="itemCategory"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="form-select"
                            required
                        >
                            <option value="" disabled>Select a category</option>
                            {activeCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>



                    {/* Optional Fields */}
                    <div className="form-group">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={isVeg}
                                onChange={(e) => setIsVeg(e.target.checked)}
                            />
                            <span>Vegetarian</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemDesc">Description (Optional)</label>
                        <textarea
                            id="itemDesc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-input"
                            rows={3}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {itemToEdit ? "Update Item" : "Add Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemModal;
