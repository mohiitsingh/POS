import { X } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Order, OrderItem } from "../../../Contexts/OrderContext";
import "../OrdersHistory.css";

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

const OrderDetailsModal = ({ isOpen, onClose, order }: OrderDetailsModalProps) => {
    if (!isOpen || !order) return null;

    // Hardcoded for demo/context missing these fields in mock logic
    const diningType = "Dine In";
    const cashierName = "Jane Doe";
    const subtotal = order.total; // Assuming total stored is final, and distinct from item sum if discounts existed
    const discount = 0;

    return (
        <div className="order-details-modal modal-overlay">
            <div className="modal-content order-details-modal-content" style={{ maxWidth: '600px', marginTop: '5rem' }}>
                <div className="modal-header">
                    <h2>Order Details</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                {/* 1. Order Summary */}
                <div className="order-summary-grid">
                    <div className="summary-item">
                        <label>Order ID</label>
                        <span className="order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="summary-item">
                        <label>Date & Time</label>
                        <span>{format(parseISO(order.date), "dd MMM yyyy, hh:mm a")}</span>
                    </div>
                    <div className="summary-item">
                        <label>Order Type</label>
                        <span>{diningType}</span>
                    </div>
                    <div className="summary-item">
                        <label>Payment</label>
                        <span>{order.paymentMethod}</span>
                    </div>
                    <div className="summary-item">
                        <label>Cashier</label>
                        <span>{cashierName}</span>
                    </div>
                </div>

                {/* 2. Item List */}
                <div className="order-items-list">
                    <div className="order-items-header">
                        <span>Item</span>
                        <span style={{ textAlign: 'center' }}>Qty</span>
                        <span style={{ textAlign: 'right' }}>Price</span>
                        <span style={{ textAlign: 'right' }}>Total</span>
                    </div>
                    {order.items.map((item: OrderItem) => (
                        <div key={item.id} className="order-item-row">
                            <span>{item.name}</span>
                            <span style={{ textAlign: 'center' }}>{item.quantity}</span>
                            <span style={{ textAlign: 'right' }}>₹{item.price}</span>
                            <span style={{ textAlign: 'right' }}>₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>

                {/* 3. Bill Summary */}
                <div className="bill-summary">
                    <div className="bill-row">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="bill-row">
                        <span>Discount</span>
                        <span>- ₹{discount.toFixed(2)}</span>
                    </div>
                    <div className="bill-row total">
                        <span>Total Amount</span>
                        <span>₹{order.total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Print Button (Optional/Future) */}
                <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                    <button onClick={onClose} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
