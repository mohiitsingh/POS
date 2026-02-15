import { useState } from "react";
import { useSettings } from "../../../Contexts/SettingsContext";
import { useOrders } from "../../../Contexts/OrderContext";
import { useToast } from "../../../Contexts/ToastContext";
import { Save, Printer, FileText, Repeat } from "lucide-react";

const PrinterSettings = () => {
    const { printer, updatePrinter } = useSettings();
    const { orders } = useOrders();
    const { showSuccess, showWarning } = useToast();
    const [formData, setFormData] = useState(printer);

    // Mock Printer List
    const availablePrinters = [
        "System Default",
        "EPSON TM-T82",
        "POS-58 Thermal",
        "HP LaserJet P1005",
        "Microsoft Print to PDF"
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData({ ...formData, [name]: val });
    };

    const handleSave = () => {
        updatePrinter(formData);
        showSuccess("Printer settings saved successfully!");
    };

    const handleTestPrint = (type: 'bill' | 'kot') => {
        // In a real Desktop App (Electron), this would send data to specific printer.
        // In Web, we just invoke window.print() with specific content mock.
        // Here we just simulate the action.
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(`
                <html>
                <head><title>Test ${type.toUpperCase()}</title></head>
                <body style="font-family: monospace; padding: 20px;">
                    <h2 style="text-align: center;">TEST ${type.toUpperCase()} PRINT</h2>
                    <hr/>
                    <p style="text-align: center;">Printer: ${type === 'bill' ? formData.billPrinter : formData.kotPrinter}</p>
                    <p style="text-align: center;">Format: ${formData.paperSize}</p>
                    <p style="text-align: center;">Font: ${formData.fontSize}</p>
                    <hr/>
                    <p>Item 1 ................... 10.00</p>
                    <p>Item 2 ................... 20.00</p>
                    <hr/>
                    <h3 style="text-align: right;">Total: 30.00</h3>
                </body>
                </html>
            `);
            w.document.close();
            w.print();
        }
    };

    const handleReprintLast = () => {
        if (orders.length === 0) {
            showWarning("No past orders found to reprint.");
            return;
        }
        // Get last order (sorted by date desc, but mock orders are list. 
        // OrderContext adds new to end? Yes, [...prev, new]. So last is last index.
        const lastOrder = orders[orders.length - 1];

        const w = window.open('', '_blank');
        if (w) {
            w.document.write(`
                <html>
                <head><title>Reprint Order #${lastOrder.id.slice(0, 6)}</title></head>
                <body style="font-family: monospace; padding: 20px;">
                    <h2 style="text-align: center;">REPRINT LAST BILL</h2>
                    <p style="text-align: center;">Order ID: #${lastOrder.id.slice(0, 8)}</p>
                    <p style="text-align: center;">Date: ${new Date(lastOrder.date).toLocaleString()}</p>
                    <hr/>
                    ${lastOrder.items.map(item => `
                        <div style="display: flex; justify-content: space-between;">
                            <span>${item.name} x${item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <hr/>
                    <h3 style="text-align: right;">Total: ₹${lastOrder.total.toFixed(2)}</h3>
                </body>
                </html>
            `);
            w.document.close();
            w.print();
        }
    };

    return (
        <div className="settings-form-section">
            <h2 className="section-title">Printer Configuration</h2>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Bill Printer</label>
                    <select
                        name="billPrinter"
                        className="form-select"
                        value={formData.billPrinter}
                        onChange={handleChange}
                    >
                        {availablePrinters.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">KOT Printer</label>
                    <select
                        name="kotPrinter"
                        className="form-select"
                        value={formData.kotPrinter}
                        onChange={handleChange}
                    >
                        {availablePrinters.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
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

            <div className="form-group">
                <label className="radio-label">
                    <input
                        type="checkbox"
                        name="showLogo"
                        checked={formData.showLogo}
                        onChange={handleChange}
                    /> Show Business Logo on Bill
                </label>
            </div>

            <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={() => handleTestPrint('bill')}>
                        <FileText size={16} style={{ marginRight: '8px' }} /> Test Bill Print
                    </button>
                    <button className="btn-secondary" onClick={() => handleTestPrint('kot')}>
                        <Printer size={16} style={{ marginRight: '8px' }} /> Test KOT Print
                    </button>
                    <button className="btn-secondary" onClick={handleReprintLast} style={{ color: '#ea580c', borderColor: '#fdba74', background: '#fff7ed' }}>
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
