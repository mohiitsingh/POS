import { DollarSign, ShoppingBag, Utensils, TrendingUp } from "lucide-react";

interface SummaryWrapperProps {
    revenue: number;
    ordersCount: number;
    dishesSold: number;
    avgOrderValue: number;
}

const SummaryCards = ({ revenue, ordersCount, dishesSold, avgOrderValue }: SummaryWrapperProps) => {
    const cards = [
        {
            label: "Total Revenue",
            value: `₹${revenue.toLocaleString()}`,
            icon: DollarSign,
        },
        {
            label: "Total Orders",
            value: ordersCount,
            icon: ShoppingBag,
        },
        {
            label: "Dishes Sold",
            value: dishesSold,
            icon: Utensils,
        },
        {
            label: "Avg Order Value",
            value: `₹${Math.round(avgOrderValue)}`,
            icon: TrendingUp,
        },
    ];

    return (
        <div className="summary-cards">
            {cards.map((card, index) => (
                <div key={index} className="summary-card">
                    <div className="card-icon">
                        <card.icon size={24} />
                    </div>
                    <div className="card-content">
                        <h3>{card.label}</h3>
                        <div className="card-value">{card.value}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;
