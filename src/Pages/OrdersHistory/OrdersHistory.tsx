import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { useOrders, type Order } from "../../Contexts/OrderContext";
import { Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import OrderDetailsModal from "./Components/OrderDetailsModal";
import "./OrdersHistory.css";

const ITEMS_PER_PAGE = 10;

const OrdersHistory = () => {
    const { orders: allOrders } = useOrders();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Sort Orders (Latest first)
    const sortedOrders = useMemo(() => {
        return [...allOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [allOrders]);

    // Pagination Logic
    const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedOrders.slice(start, start + ITEMS_PER_PAGE);
    }, [currentPage, sortedOrders]);

    // Handlers
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Scroll to top of table
            // document.getElementById('orders-top')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Empty State
    if (sortedOrders.length === 0) {
        return (
            <div className="orders-history-container">
                <div className="history-empty">
                    <span style={{ fontSize: "3rem" }}>🧾</span>
                    <h2>No orders found</h2>
                    <p>Your completed bills will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-history-container">
            <header className="orders-header">
                <h1>Orders History</h1>
                {/* Date filter could go here if needed, but requirements prioritized simple list first */}
            </header>

            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Order Date</th>
                            <th>Order Type</th>
                            <th>Payment</th>
                            <th>Amount (₹)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map(order => (
                            <tr key={order.id}>
                                <td className="order-id">#{order.id.slice(0, 8).toUpperCase()}</td>
                                <td>{format(parseISO(order.date), "dd MMM yyyy, hh:mm a")}</td>
                                <td>
                                    <span className="order-type" style={{
                                        // padding: '0.25rem 0.5rem',
                                        // borderRadius: '0.25rem',
                                        backgroundColor: '#e0f2fe',
                                        color: '#0369a1',
                                        // fontSize: '0.8rem',
                                        // fontWeight: 500
                                    }}>
                                        Dine In
                                    </span>
                                </td>
                                <td>
                                    <span className="order-payment" style={{
                                        // padding: '0.25rem 0.5rem',
                                        // borderRadius: '0.25rem',
                                        backgroundColor: order.paymentMethod === 'Online' ? '#dcfce7' : '#fef9c3', // Green for Online, Yellow for Cash
                                        color: order.paymentMethod === 'Online' ? '#166534' : '#854d0e',
                                        // fontSize: '0.8rem',
                                        // fontWeight: 500
                                    }}>
                                        {order.paymentMethod}
                                    </span>
                                </td>
                                <td className="amount-cell">₹{order.total.toFixed(2)}</td>
                                <td>
                                    <button
                                        className="btn-secondary"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                        onClick={() => handleViewDetails(order)}
                                    >
                                        <Eye size={14} style={{ marginRight: '4px' }} /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {
                totalPages > 1 && (
                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            title="First Page"
                        >
                            <ChevronsLeft size={18} />
                        </button>
                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            title="Previous Page"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="page-info">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            title="Next Page"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            title="Last Page"
                        >
                            <ChevronsRight size={18} />
                        </button>
                    </div>
                )
            }

            {/* Details Modal */}
            <OrderDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                order={selectedOrder}
            />
        </div >
    );
};

export default OrdersHistory;
