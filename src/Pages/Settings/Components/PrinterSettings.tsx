import { useState, useEffect } from "react";
import { useSettings } from "../../../Contexts/SettingsContext";
import { useOrders } from "../../../Contexts/OrderContext";
import { useToast } from "../../../Contexts/ToastContext";
import { Save, FileText, Repeat } from "lucide-react";
import { printBill, printKOT, type BillPrintData } from "../../../Utils/printBill";

const PrinterSettings = () => {
    const { printer, updatePrinter, billing } = useSettings();
    const { orders } = useOrders();
    const { showSuccess, showWarning } = useToast();
    const [formData, setFormData] = useState(printer);

    // Sync form when printer settings load asynchronously from Supabase
    useEffect(() => {
        setFormData(printer);
    }, [printer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData({ ...formData, [name]: val });
    };

    const handleSave = () => {
        updatePrinter(formData);
        showSuccess("Printer settings saved successfully!");
    };

    /** Build a sample BillPrintData for test prints */
    const buildSampleBillData = (): BillPrintData => {
        const now = new Date().toISOString();
        const subtotal = 350;
        const discount = 0;
        const taxAmount = billing.taxValueType === 'percentage'
            ? (subtotal - discount) * (billing.taxValue / 100)
            : billing.taxValue;
        const rawTotal = subtotal - discount + (billing.taxType === 'forward' ? taxAmount : 0);
        const grandTotal = Math.round(rawTotal);
        const roundOff = grandTotal - rawTotal;
        return {
            businessName: billing.businessName || 'Your Business Name',
            businessAddress: billing.businessAdresss || '123, Sample Street, City',
            businessPhone: billing.businessPhone || '',
            gstNo: billing.gstNo || '',
            fssaiNo: billing.fssaiNo || '',
            orderDate: now,
            diningType: 'Dine In',
            tableNo: 'T1',
            tokenNumber: 1,
            orderId: 'SAMPLE00-0000-0000-0000-SAMPLEORDER',
            paymentMethod: 'Cash',
            items: [
                { name: 'Paneer Butter Masala', quantity: 2, price: 120 },
                { name: 'Butter Naan', quantity: 3, price: 30 },
                { name: 'Lassi', quantity: 1, price: 50 },
            ],
            subtotal,
            discount,
            taxLabel: billing.taxValueType === 'percentage'
                ? `Tax (${billing.taxValue}%)`
                : 'Tax (Fixed)',
            taxAmount,
            roundOff,
            grandTotal,
            paperSize: formData.paperSize,
            fontSize: formData.fontSize,
        };
    };

    const handleTestPrint = () => {
        printBill(buildSampleBillData());
    };

    const handleTestKOT = () => {
        printKOT({
            tokenNumber: 1,
            diningType: 'Dine In',
            tableNo: 'T1',
            items: [
                { name: 'Paneer Butter Masala', quantity: 2 },
                { name: 'Butter Naan', quantity: 3 },
                { name: 'Lassi', quantity: 1 },
            ],
            paperSize: formData.paperSize,
            fontSize: formData.fontSize,
        });
    };

    const handleReprintLast = () => {
        if (orders.length === 0) {
            showWarning("No past orders found to reprint.");
            return;
        }
        const lastOrder = [...orders].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        const subtotal = lastOrder.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const discount = 0;
        const taxAmount = billing.taxValueType === 'percentage'
            ? (subtotal - discount) * (billing.taxValue / 100)
            : billing.taxValue;
        const rawTotal = subtotal - discount + (billing.taxType === 'forward' ? taxAmount : 0);
        const grandTotal = Math.round(rawTotal);
        const roundOff = grandTotal - rawTotal;

        printBill({
            businessName: billing.businessName,
            businessAddress: billing.businessAdresss,
            businessPhone: billing.businessPhone || '',
            gstNo: billing.gstNo || '',
            fssaiNo: billing.fssaiNo || '',
            orderDate: lastOrder.date,
            diningType: lastOrder.tableNo ? 'Dine In' : 'Take Away',
            tableNo: lastOrder.tableNo,
            tokenNumber: 0, // reprint — token not trackable retroactively
            orderId: lastOrder.id,
            paymentMethod: lastOrder.paymentMethod,
            items: lastOrder.items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
            subtotal,
            discount,
            taxLabel: billing.taxValueType === 'percentage'
                ? `Tax (${billing.taxValue}%)`
                : 'Tax (Fixed)',
            taxAmount,
            roundOff,
            grandTotal,
            paperSize: formData.paperSize,
            fontSize: formData.fontSize,
        });
    };

    return (
        <div className="settings-form-section">
            <h2 className="section-title">Printer Configuration</h2>
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Enter the <strong>exact printer name</strong> as shown in your OS printer settings. The OS print dialog will appear when printing — you can also change the printer there.
            </p>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Bill Printer</label>
                    <input
                        type="text"
                        name="billPrinter"
                        className="form-input"
                        placeholder="e.g. EPSON TM-T82"
                        value={formData.billPrinter}
                        onChange={handleChange}
                    />
                    <span className="helper-text">Leave blank to use the system default</span>
                </div>
                <div className="form-group">
                    <label className="form-label">KOT Printer <span style={{ color: 'var(--color-text-light)', fontWeight: 400 }}>(Optional)</span></label>
                    <input
                        type="text"
                        name="kotPrinter"
                        className="form-input"
                        placeholder="e.g. POS-58 Thermal (leave blank to skip KOT)"
                        value={formData.kotPrinter}
                        onChange={handleChange}
                    />
                    <span className="helper-text">If empty, KOT print will be skipped</span>
                </div>
            </div>

            <h2 className="section-title" style={{ marginTop: '2rem' }}>Print Format</h2>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Paper Size</label>
                    <div className="radio-group" style={{ height: '42px' }}>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="paperSize"
                                value="58mm"
                                checked={formData.paperSize === '58mm'}
                                onChange={handleChange}
                            /> 58mm (2 inch)
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="paperSize"
                                value="80mm"
                                checked={formData.paperSize === '80mm'}
                                onChange={handleChange}
                            /> 80mm (3 inch)
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Font Size</label>
                    <select
                        name="fontSize"
                        className="form-select"
                        value={formData.fontSize}
                        onChange={handleChange}
                    >
                        <option value="small">Small (Compact)</option>
                        <option value="medium">Medium (Standard)</option>
                        <option value="large">Large (Readable)</option>
                    </select>
                </div>
            </div>

            <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={handleTestPrint}>
                        <FileText size={16} style={{ marginRight: '8px' }} /> Test Bill Print
                    </button>
                    {formData.kotPrinter.trim() && (
                        <button className="btn-secondary" onClick={handleTestKOT}>
                            <FileText size={16} style={{ marginRight: '8px' }} /> Test KOT Print
                        </button>
                    )}
                    <button
                        className="btn-secondary"
                        onClick={handleReprintLast}
                        style={{ color: '#ea580c', borderColor: '#fdba74', background: '#fff7ed' }}
                    >
                        <Repeat size={16} style={{ marginRight: '8px' }} /> Reprint Last Bill
                    </button>
                </div>

                <button className="btn-primary setting-btn" onClick={handleSave}>
                    <Save size={18} /> Save Settings
                </button>
            </div>
        </div>
    );
};

export default PrinterSettings;
