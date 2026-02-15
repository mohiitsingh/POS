import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export interface ReportData {
    date: string;
    totalRevenue: number;
    totalOrders: number;
    dishesSold: number;
    avgOrderValue: number;
    topItems: Array<{ name: string; quantity: number; revenue: number }>;
}

export const generatePDFReport = (data: ReportData, dateRange: string) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(74, 222, 128); // Primary Green
    doc.text("RestroBit", 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Sales Report", 14, 30);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Period: ${dateRange}`, 14, 38);
    doc.text(`Generated: ${format(new Date(), "PPpp")}`, 14, 44);

    // Summary Cards Section
    const startY = 55;
    doc.setDrawColor(200);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, startY, 180, 25, 3, 3, "FD");

    doc.setFontSize(10);
    doc.setTextColor(50);
    
    // Metrics
    const metrics = [
        { label: "Revenue", value: `INR ${data.totalRevenue.toLocaleString()}` },
        { label: "Orders", value: data.totalOrders.toString() },
        { label: "Dishes Sold", value: data.dishesSold.toString() },
        { label: "Avg Order Value", value: `INR ${Math.round(data.avgOrderValue)}` }
    ];

    let xPos = 20;
    metrics.forEach(metric => {
        doc.text(metric.label, xPos, startY + 8);
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(metric.value, xPos, startY + 18);
        
        doc.setFontSize(10);
        doc.setTextColor(50);
        xPos += 45;
    });

    // Top Selling Items Table
    doc.text("Top Selling Items", 14, startY + 40);

    const tableData = data.topItems.map(item => [
        item.name,
        item.quantity.toString(),
        `INR ${item.revenue.toLocaleString()}`
    ]);

    autoTable(doc, {
        startY: startY + 45,
        head: [["Item Name", "Quantity Sold", "Revenue"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [74, 222, 128] }, // Green header
    });

    // Save
    const fileName = `Arambh_Report_${format(new Date(), "yyyy_MM_dd")}.pdf`;
    doc.save(fileName);
};
