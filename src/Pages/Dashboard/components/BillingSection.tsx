
import React, { useEffect, useState } from "react";
import { Plus, Minus, Trash2, Printer, FileText, Coffee } from "lucide-react";
import { type Dish } from "../data";
import { useSettings } from "../../../Contexts/SettingsContext";
import { useOrders, type Draft } from "../../../Contexts/OrderContext";
import { useTables } from "../../../Contexts/TableContext";
import { useToast } from "../../../Contexts/ToastContext";
import DraftsListModal from "./DraftsListModal";
import TableModal from "./TableModal";
import { printBill, printKOT } from "../../../Utils/printBill";
import { getNextToken } from "../../../Utils/tokenNumber";

export interface CartItem extends Dish {
    quantity: number;
}

interface BillingSectionProps {
    cart: CartItem[];
    onUpdateQuantity: (dish: Dish, qty: number) => void;
    onRemoveItem: (dishId: string) => void;
    onClearBill: () => void;
    onLoadCart: (items: CartItem[]) => void;
}

const BillingSection: React.FC<BillingSectionProps> = ({
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onClearBill,
    onLoadCart,
}) => {
    const { billing, printer } = useSettings();
    const { saveDraft, drafts, deleteDraft, addOrder } = useOrders();
    const { tables } = useTables();
    const { showSuccess, showError, showWarning } = useToast();

    const [discount, setDiscount] = useState(0);
    const [diningType, setDiningType] = useState("Dine In");
    const [selectedTable, setSelectedTable] = useState("");
    const [isDraftsOpen, setIsDraftsOpen] = useState(false);
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online'>('Cash');

    // Initialize/Update discount when default setting changes
    useEffect(() => {
        if (billing.discountType === 'fixed') {
            setDiscount(billing.discountValue);
        } else {
            setDiscount(0);
        }
    }, [billing.discountType, billing.discountValue]);


    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Let's refine: The input below allows editing the amount.
    const validDiscount = Math.min(discount, subtotal);

    // Calculate Tax
    const taxAmount = billing.taxValueType === 'percentage'
        ? (subtotal - validDiscount) * (billing.taxValue / 100)
        : billing.taxValue;

    const total = subtotal - validDiscount + (billing.taxType === 'forward' ? taxAmount : 0);

    // Handlers
    const handleSaveDraft = () => {
        if (cart.length === 0) {
            showWarning("Cart is empty. Cannot save draft.");
            return;
        }
        if (diningType === "Dine In" && !selectedTable) {
            // Optional: Enforce table selection? User story said "Optional Table Number dropdown", so maybe not strictly required to block saving?
            // But "User can save the bill to the draft along with the table number" implies we should capture it.
        }

        saveDraft(cart, total, selectedTable || undefined);
        onLoadCart([]);
        setSelectedTable(""); // Reset table
        showSuccess("Draft saved successfully!");
    };

    const handleResumeDraft = (draft: Draft) => {
        onLoadCart(draft.items);
        if (draft.tableNo) {
            setDiningType("Dine In");
            setSelectedTable(draft.tableNo);
        }
        deleteDraft(draft.id); // Consume draft
        setIsDraftsOpen(false);
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;

        // Validate business information
        if (!billing.businessName || billing.businessName.trim() === '') {
            showError('Business Information Required\n\nPlease fill in your Business Name in Settings > Billing Configuration before placing orders.');
            return;
        }

        const orderItems = cart.map(item => ({
            id: crypto.randomUUID(),
            menuItemId: item.id.toString(),
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));

        await addOrder({
            items: orderItems,
            total,
            status: 'completed',
            tableNo: diningType === 'Dine In' ? selectedTable : undefined,
            paymentMethod
        });

        // --- Print Bill ---
        const rawTotal = subtotal - validDiscount + (billing.taxType === 'forward' ? taxAmount : 0);
        const grandTotal = Math.round(rawTotal);
        const roundOff = grandTotal - rawTotal;
        const tokenNumber = getNextToken();

        const billPrinted = await printBill({
            businessName: billing.businessName,
            businessAddress: billing.businessAdresss,
            businessPhone: billing.businessPhone,
            gstNo: billing.gstNo,
            fssaiNo: billing.fssaiNo,
            orderDate: new Date().toISOString(),
            diningType,
            tableNo: diningType === 'Dine In' ? selectedTable : undefined,
            tokenNumber,
            orderId: crypto.randomUUID(),
            paymentMethod,
            items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
            subtotal,
            discount: validDiscount,
            taxLabel: billing.taxValueType === 'percentage'
                ? `Tax (${billing.taxValue}%)`
                : 'Tax (Fixed)',
            taxAmount,
            roundOff,
            grandTotal,
            paperSize: printer.paperSize,
            fontSize: printer.fontSize,
        }, printer.billPrinter);

        if (!billPrinted) {
            showWarning('Bill not printed. Make sure the Arambh Printer Service is running and a Bill Printer is selected in Settings.');
        }

        // --- KOT Print (if KOT printer is configured) ---
        const effectiveKOTPrinter = printer.kotOnBillPrinter ? printer.billPrinter : printer.kotPrinter;
        if (effectiveKOTPrinter.trim()) {
            printKOT({
                tokenNumber,
                diningType,
                tableNo: diningType === 'Dine In' ? selectedTable : undefined,
                items: cart.map(i => ({ name: i.name, quantity: i.quantity })),
                paperSize: printer.paperSize,
                fontSize: printer.fontSize,
            }, effectiveKOTPrinter);
        }

        onLoadCart([]);
        showSuccess("Order placed successfully!");

    };

    return (
        <div className="billing-section">
            <DraftsListModal
                isOpen={isDraftsOpen}
                onClose={() => setIsDraftsOpen(false)}
                drafts={drafts}
                onResume={handleResumeDraft}
                onDelete={deleteDraft}
            />
            <TableModal
                isOpen={isTableModalOpen}
                onClose={() => setIsTableModalOpen(false)}
                tables={tables}
                drafts={drafts}
                onSelectTable={handleResumeDraft}
            />

            {/* Section 1: Drafts & New Bill */}
            <div className="billing-header">
                <div className="billing-actions-top">
                    <button className="action-btn secondary" onClick={() => setIsDraftsOpen(true)}>
                        <FileText size={16} /> Draft List
                        {drafts.length > 0 && <span style={{ marginLeft: '0.5rem', background: '#3b82f6', color: 'white', fontSize: '0.7rem', padding: '0 0.4rem', borderRadius: '1rem' }}>{drafts.length}</span>}
                    </button>
                    <button className="action-btn secondary" onClick={() => setIsTableModalOpen(true)}>
                        <Coffee size={16} /> Table
                    </button>
                </div>
                <button className="action-btn new-btn" onClick={onClearBill}>
                    <Plus size={16} /> New Bill
                </button>
            </div>

            {/* Section 2: Bill Items */}
            <div className="bill-items-container">
                {cart.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-icon">🛒</div>
                        <p>No items added yet</p>
                        <span>Select dishes from the menu to start billing</span>
                    </div>
                ) : (
                    <div className="bill-items-list">
                        {cart.map((item) => (
                            <div key={item.id} className="bill-item">
                                <div className="item-details">
                                    <h4>{item.name}</h4>
                                    <div className="item-price-calc">
                                        ₹{item.price.toFixed(2)} × {item.quantity} = <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                                    </div>
                                </div>
                                <div className="item-controls">
                                    <button onClick={() => onUpdateQuantity(item, item.quantity - 1)} className="qty-btn-sm">
                                        <Minus size={12} />
                                    </button>
                                    <span className="qty-val">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item, item.quantity + 1)} className="qty-btn-sm">
                                        <Plus size={12} />
                                    </button>
                                    <button onClick={() => onRemoveItem(item.id)} className="remove-btn">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 3: Bill Summary & Actions */}
            <div className="bill-summary-section">
                {/* Sub-Section A: Price Summary */}
                <div className="price-summary">
                    <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Discount:</span>
                        <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="discount-input"
                            placeholder="Amount"
                        />
                    </div>
                    {/* Tax Row */}
                    <div className="summary-row">
                        <span>Tax ({billing.taxValueType === 'percentage' ? `${billing.taxValue}% ` : 'Fixed'}):</span>
                        <span>₹{taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="summary-row total-row">
                        <span>Total:</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Sub-Section B: Order Options */}
                <div className="order-options">
                    <select
                        value={diningType}
                        onChange={(e) => setDiningType(e.target.value)}
                        className="dining-select"
                    >
                        <option value="Dine In">Dine In</option>
                        <option value="Take Away">Take Away</option>
                        <option value="Delivery">Delivery</option>
                    </select>

                    {diningType === "Dine In" && (
                        <select
                            value={selectedTable}
                            onChange={(e) => setSelectedTable(e.target.value)}
                            className="dining-select" // Reusing same class for styling
                            style={{ marginLeft: '0.5rem' }}
                        >
                            <option value="">Select Table</option>
                            {tables.filter(t => t.status === 'active').map(table => (
                                <option key={table.id} value={table.tableNo}>
                                    {table.tableNo}
                                </option>
                            ))}
                        </select>

                    )}

                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Online')}
                        className="dining-select"
                        style={{ marginLeft: '0.5rem' }}
                    >
                        <option value="Cash">Cash</option>
                        <option value="Online">Online</option>
                    </select>

                    <button className="draft-btn" onClick={handleSaveDraft}>
                        Save Draft
                    </button>
                </div>

                {/* Final Action */}
                <button className="print-btn" disabled={cart.length === 0} onClick={handlePlaceOrder}>
                    <Printer size={18} />
                    Place Order & Print
                </button>
            </div >
        </div >
    );
};

export default BillingSection;
