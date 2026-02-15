interface TopItem {
    name: string;
    quantity: number;
    revenue: number;
}

interface TopItemsTableProps {
    items: TopItem[];
}

const TopItemsTable = ({ items }: TopItemsTableProps) => {
    return (
        <div className="top-items-section">
            <h3 className="section-title">🥇 Top Selling Disheset</h3>

            {items.length === 0 ? (
                <p style={{ color: "var(--color-text-light)", textAlign: "center" }}>No sales for selected period</p>
            ) : (
                <div className="top-items-list">
                    {items.map((item, index) => (
                        <div key={index} className="top-item-row">
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div className="item-rank">{index + 1}</div>
                                <div className="item-details">
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-stats">{item.quantity} orders</div>
                                </div>
                            </div>
                            <div className="item-revenue">₹{item.revenue.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopItemsTable;
