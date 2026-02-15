import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { parseISO, getHours, getDate, getMonth } from 'date-fns';
import type { Order } from '../../../Contexts/OrderContext';

interface SalesChartProps {
    orders: Order[];
    filterType: 'day' | 'month' | 'year';
    selectedDate: Date;
}

const SalesChart = ({ orders, filterType }: SalesChartProps) => {

    // Process Data for Chart based on Filter
    const processData = () => {
        const dataMap = new Map<string, number>();

        if (filterType === 'day') {
            // Hour-wise (00 to 23)
            // Initialize all hours with 0
            for (let i = 0; i < 24; i++) {
                const label = `${i}:00`;
                dataMap.set(label, 0);
            }

            orders.forEach(order => {
                const date = parseISO(order.date);
                const hour = getHours(date);
                const label = `${hour}:00`;
                dataMap.set(label, (dataMap.get(label) || 0) + 1); // Count orders
            });
        }
        else if (filterType === 'month') {
            // Day-wise (1 to 31)
            // We'll just map existing dates to avoid creating keys for all 31 days statically, but for charts simpler to have holes or fill them.
            // Let's fill holes for better chart look
            for (let i = 1; i <= 31; i++) {
                dataMap.set(i.toString(), 0);
            }

            orders.forEach(order => {
                const date = parseISO(order.date);
                const day = getDate(date);
                dataMap.set(day.toString(), (dataMap.get(day.toString()) || 0) + 1);
            });
        }
        else if (filterType === 'year') {
            // Month-wise (Jan to Dec)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            months.forEach(m => dataMap.set(m, 0));

            orders.forEach(order => {
                const date = parseISO(order.date);
                const month = getMonth(date); // 0-11
                const label = months[month];
                dataMap.set(label, (dataMap.get(label) || 0) + 1);
            });
        }

        return Array.from(dataMap).map(([name, value]) => ({ name, value }));
    };

    const data = processData();

    return (
        <div className="chart-section">
            <h3 className="section-title">📉 Orders Trend</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            interval={filterType === 'day' ? 2 : 0} // Skip tick labels if too crowded
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f3f4f6' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar
                            dataKey="value"
                            fill="#4ade80"
                            radius={[4, 4, 0, 0]}
                            barSize={filterType === 'year' ? 40 : 20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
