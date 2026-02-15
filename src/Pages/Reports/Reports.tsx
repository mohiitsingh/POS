import { useState, useMemo } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, addMonths, addYears, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { useOrders, type Order, type OrderItem } from "../../Contexts/OrderContext";
import SummaryCards from "./Components/SummaryCards";
import SalesChart from "./Components/SalesChart";
import TopItemsTable from "./Components/TopItemsTable";
import { generatePDFReport } from "../../Utils/ExportUtils";
import "./Reports.css";

type FilterType = 'day' | 'month' | 'year';

const Reports = () => {
    const { getOrdersByDateRange, orders: allOrders } = useOrders();
    const [filterType, setFilterType] = useState<FilterType>('day');
    const [selectedDate, setSelectedDate] = useState(new Date());

    // 1. Calculate Date Range based on Filter & Selected Date
    const dateRange = useMemo(() => {
        let start: Date, end: Date;
        if (filterType === 'day') {
            start = startOfDay(selectedDate);
            end = endOfDay(selectedDate);
        } else if (filterType === 'month') {
            start = startOfMonth(selectedDate);
            end = endOfMonth(selectedDate);
        } else {
            start = startOfYear(selectedDate);
            end = endOfYear(selectedDate);
        }
        return { start, end };
    }, [filterType, selectedDate]);

    // 2. Fetch Orders for Range
    const orders = useMemo(() => {
        return getOrdersByDateRange(dateRange.start, dateRange.end);
    }, [dateRange, getOrdersByDateRange]); // Dependency on getOrdersByDateRange is stable from context

    // 3. Compute Metrics
    const metrics = useMemo(() => {
        const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const dishesSold = orders.reduce((sum: number, order: Order) => sum + order.items.reduce((isum: number, item: OrderItem) => isum + item.quantity, 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Top Items Calculation
        const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
        orders.forEach((order: Order) => {
            order.items.forEach((item: OrderItem) => {
                const existing = itemMap.get(item.name);
                if (existing) {
                    existing.quantity += item.quantity;
                    existing.revenue += item.price * item.quantity;
                } else {
                    itemMap.set(item.name, {
                        name: item.name,
                        quantity: item.quantity,
                        revenue: item.price * item.quantity
                    });
                }
            });
        });

        const topItems = Array.from(itemMap.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            totalRevenue,
            totalOrders,
            dishesSold,
            avgOrderValue,
            topItems
        };
    }, [orders]);

    // Handlers
    const handlePrev = () => {
        if (filterType === 'day') setSelectedDate(d => addDays(d, -1));
        else if (filterType === 'month') setSelectedDate(d => addMonths(d, -1));
        else setSelectedDate(d => addYears(d, -1));
    };

    const handleNext = () => {
        if (filterType === 'day') setSelectedDate(d => addDays(d, 1));
        else if (filterType === 'month') setSelectedDate(d => addMonths(d, 1));
        else setSelectedDate(d => addYears(d, 1));
    };

    const handleExport = () => {
        let dateStr = "";
        if (filterType === 'day') dateStr = format(selectedDate, "PP");
        else if (filterType === 'month') dateStr = format(selectedDate, "MMMM yyyy");
        else dateStr = format(selectedDate, "yyyy");

        generatePDFReport({
            date: dateStr,
            ...metrics
        }, dateStr);
    };

    // Format Display Date
    const displayDate = useMemo(() => {
        if (filterType === 'day') return format(selectedDate, "dd MMM yyyy");
        if (filterType === 'month') return format(selectedDate, "MMMM yyyy");
        return format(selectedDate, "yyyy");
    }, [filterType, selectedDate]);

    // Empty Global State Check (First time user)
    // Note: The mock generator usually populates logic, but if we strictly check 'no orders in system whatsoever':
    if (allOrders.length === 0) {
        return (
            <div className="reports-empty">
                <span style={{ fontSize: "3rem" }}>📊</span>
                <h2>No sales data found</h2>
                <p>Start billing to see your reports here.</p>
            </div>
        );
    }

    return (
        <div className="reports-container">
            {/* Header */}
            <header className="reports-header">
                <h1>Reports</h1>

                <div className="report-actions">
                    <div className="date-filter-group">
                        <button
                            className={`filter-btn ${filterType === 'day' ? 'active' : ''}`}
                            onClick={() => setFilterType('day')}
                        >
                            Day
                        </button>
                        <button
                            className={`filter-btn ${filterType === 'month' ? 'active' : ''}`}
                            onClick={() => setFilterType('month')}
                        >
                            Month
                        </button>
                        <button
                            className={`filter-btn ${filterType === 'year' ? 'active' : ''}`}
                            onClick={() => setFilterType('year')}
                        >
                            Year
                        </button>

                        <div style={{ display: "flex", alignItems: "center", borderLeft: "1px solid var(--color-border)", marginLeft: "0.5rem", paddingLeft: "0.5rem" }}>
                            <button onClick={handlePrev} className="filter-btn"><ChevronLeft size={16} /></button>
                            <span className="date-display">{displayDate}</span>
                            <button onClick={handleNext} className="filter-btn"><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    <button className="btn-primary" onClick={handleExport}>
                        <Download size={18} /> Export
                    </button>
                </div>
            </header>

            {/* Summary Cards */}
            <SummaryCards
                revenue={metrics.totalRevenue}
                ordersCount={metrics.totalOrders}
                dishesSold={metrics.dishesSold}
                avgOrderValue={metrics.avgOrderValue}
            />

            {/* Content Grid */}
            <div className="reports-content">
                {/* Chart */}
                <SalesChart
                    orders={orders}
                    filterType={filterType}
                    selectedDate={selectedDate}
                />

                {/* Top Items */}
                <TopItemsTable items={metrics.topItems} />
            </div>
        </div>
    );
};

export default Reports;
