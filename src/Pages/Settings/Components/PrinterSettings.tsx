import { useState, useEffect, useCallback } from "react";
import { useSettings } from "../../../Contexts/SettingsContext";
import { useOrders } from "../../../Contexts/OrderContext";
import { useToast } from "../../../Contexts/ToastContext";
import { Save, FileText, Repeat, Wifi, WifiOff, RefreshCw, Printer, Download } from "lucide-react";
import { printBill, printKOT, isServiceRunning, getServicePrinters, type BillPrintData } from "../../../Utils/printBill";

// ─── Session-level cache so tab switches don't re-query the service ──────────
const CACHE_KEY = 'arambh_printer_cache';
interface PrinterCache { online: boolean; printers: string[]; ts: number; }
function loadCache(): PrinterCache | null {
    try { return JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null'); }
    catch { return null; }
}
function saveCache(online: boolean, printers: string[]) {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ online, printers, ts: Date.now() }));
}
function clearCache() { sessionStorage.removeItem(CACHE_KEY); }
// ─────────────────────────────────────────────────────────────────────────────

const PrinterSettings = () => {
    const { printer, updatePrinter, billing } = useSettings();
    const { orders } = useOrders();
    const { showSuccess, showWarning, showError } = useToast();

    const [formData, setFormData] = useState(printer);
    const [serviceOnline, setServiceOnline] = useState<boolean | null>(null); // null = checking
    const [detectedPrinters, setDetectedPrinters] = useState<string[]>([]);
    const [loadingPrinters, setLoadingPrinters] = useState(false);

    // Sync form when printer settings load from Supabase
    useEffect(() => {
        setFormData(printer);
    }, [printer]);

    // ─── Service & Printer Detection ──────────────────────────────────────────
    /**
     * Checks the service and updates the printer list.
     * @param forceRefresh  true  → always hit the WebSocket (Refresh button)
     *                      false → use cache if the saved printer is already known
     */
    const checkServiceAndPrinters = useCallback(async (forceRefresh = false) => {
        // Try loading from cache first (skip WebSocket call on tab switch)
        if (!forceRefresh) {
            const cache = loadCache();
            if (cache) {
                const savedBill = printer.billPrinter;
                const savedKOT = printer.kotPrinter;
                // Use cache if both saved printers are still present (or empty = using default)
                const billOk = !savedBill || cache.printers.includes(savedBill);
                const kotOk = !savedKOT || cache.printers.includes(savedKOT);
                if (billOk && kotOk) {
                    setServiceOnline(cache.online);
                    setDetectedPrinters(cache.printers);
                    return; // ✅ served from cache, no WebSocket call needed
                }
                // Saved printer not in cache → printer may have changed; do a fresh check
            }
        }

        // Fresh check via WebSocket
        setServiceOnline(null);
        setLoadingPrinters(true);
        const running = await isServiceRunning();
        setServiceOnline(running);

        if (running) {
            const printers = await getServicePrinters();
            setDetectedPrinters(printers);
            saveCache(true, printers);
        } else {
            setDetectedPrinters([]);
            clearCache();
        }
        setLoadingPrinters(false);
    }, [printer.billPrinter, printer.kotPrinter]);

    useEffect(() => {
        checkServiceAndPrinters(false); // on mount / tab switch → use cache when possible
    }, [checkServiceAndPrinters]);

    // ─── Form Handlers ────────────────────────────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData({ ...formData, [name]: val });
    };

    const handleSave = () => {
        updatePrinter(formData);
        showSuccess("Printer settings saved successfully!");
    };

    // ─── Effective printer names ──────────────────────────────────────────────
    // If kotOnBillPrinter is true → use bill printer for KOT
    const effectiveKOTPrinter = formData.kotOnBillPrinter ? formData.billPrinter : formData.kotPrinter;

    // ─── Sample Bill Data ─────────────────────────────────────────────────────
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

    const handleTestPrint = async () => {
        const ok = await printBill(buildSampleBillData(), formData.billPrinter);
        if (ok) showSuccess('Test bill sent to printer!');
        else showError('Print failed. Make sure the Arambh Printer Service is running and a Bill Printer is selected.');
    };

    const handleTestKOT = async () => {
        const ok = await printKOT({
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
        }, effectiveKOTPrinter);
        if (ok) showSuccess('Test KOT sent to printer!');
        else showError('KOT print failed. Make sure the Arambh Printer Service is running and a KOT Printer is selected.');
    };

    const handleReprintLast = async () => {
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

        const ok = await printBill({
            businessName: billing.businessName,
            businessAddress: billing.businessAdresss,
            businessPhone: billing.businessPhone || '',
            gstNo: billing.gstNo || '',
            fssaiNo: billing.fssaiNo || '',
            orderDate: lastOrder.date,
            diningType: lastOrder.tableNo ? 'Dine In' : 'Take Away',
            tableNo: lastOrder.tableNo,
            tokenNumber: 0,
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
        }, formData.billPrinter);
        if (ok) showSuccess('Last bill reprinted successfully!');
        else showError('Reprint failed. Make sure the Arambh Printer Service is running and a Bill Printer is selected.');
    };

    // ─── Printer selector component ───────────────────────────────────────────
    const PrinterSelector = ({
        label,
        name,
        value,
        helperText,
        disabled = false,
    }: {
        label: string;
        name: string;
        value: string;
        helperText?: string;
        disabled?: boolean;
    }) => {
        if (serviceOnline && detectedPrinters.length > 0) {
            return (
                <div className="form-group">
                    <label className="form-label">{label}</label>
                    <select
                        name={name}
                        className="form-select"
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                    >
                        <option value="">— Select Printer —</option>
                        {detectedPrinters.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    {helperText && <span className="helper-text">{helperText}</span>}
                </div>
            );
        }
        // Fallback: text input when service is not running
        return (
            <div className="form-group">
                <label className="form-label">{label}</label>
                <input
                    type="text"
                    name={name}
                    className="form-input"
                    placeholder="e.g. EPSON TM-T82"
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                />
                {helperText && <span className="helper-text">{helperText}</span>}
            </div>
        );
    };

    const onlyOnePrinter = detectedPrinters.length === 1;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="settings-form-section">

            {/* ── Service Download Banner ─────────────────────────────────── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                background: serviceOnline
                    ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                    : serviceOnline === false
                        ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'
                        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: `1px solid ${serviceOnline ? '#86efac' : serviceOnline === false ? '#fdba74' : '#e2e8f0'}`,
                gap: '1rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {serviceOnline === null ? (
                        <RefreshCw size={18} style={{ color: '#94a3b8', animation: 'spin 1s linear infinite' }} />
                    ) : serviceOnline ? (
                        <Wifi size={18} style={{ color: '#16a34a' }} />
                    ) : (
                        <WifiOff size={18} style={{ color: '#ea580c' }} />
                    )}
                    <div>
                        <div style={{
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            color: serviceOnline ? '#15803d' : serviceOnline === false ? '#c2410c' : '#64748b'
                        }}>
                            {serviceOnline === null
                                ? 'Checking print service…'
                                : serviceOnline
                                    ? '✅ Arambh Printer Service — Running'
                                    : '⚠️ Arambh Printer Service — Not Detected'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                            {serviceOnline === null
                                ? 'Please wait…'
                                : serviceOnline
                                    ? `${detectedPrinters.length} printer(s) detected on this PC`
                                    : 'Install the service below for silent printing. Without it, the browser print dialog will be used.'}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                        className="btn-secondary"
                        onClick={() => checkServiceAndPrinters(true)}
                        disabled={loadingPrinters}
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        title="Refresh printer list"
                    >
                        <RefreshCw size={14} style={{ marginRight: '6px' }} />
                        Refresh
                    </button>
                    {!serviceOnline && (
                        <a
                            href="https://ccntloscimlkaltshibm.supabase.co/storage/v1/object/public/pos-printers/ArambhPrinterService.zip"
                            download="ArambhPrinterService.zip"
                            className="btn-secondary"
                            style={{
                                padding: '6px 14px',
                                fontSize: '0.82rem',
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: 'inherit',
                                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                                borderColor: '#93c5fd',
                            }}
                        >
                            <Download size={14} style={{ marginRight: '6px' }} />
                            Download Service
                        </a>
                    )}
                </div>
            </div>

            {/* ── Printer Configuration ───────────────────────────────────── */}
            <h2 className="section-title">
                <Printer size={17} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Printer Configuration
            </h2>

            {serviceOnline && detectedPrinters.length === 0 && (
                <p style={{
                    color: '#92400e',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    marginBottom: '1rem'
                }}>
                    ⚠️ Service is running but no printers were detected. Make sure your thermal printer is connected and installed in Windows Settings → Printers.
                </p>
            )}

            {!serviceOnline && serviceOnline !== null && (
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    Service not running. You can still type the printer names manually — they'll be used when the service starts.
                </p>
            )}

            <div className="form-row">
                <PrinterSelector
                    label="Bill Printer"
                    name="billPrinter"
                    value={formData.billPrinter}
                    helperText={serviceOnline ? 'Select from auto-detected printers' : 'Leave blank to use system default'}
                />
                <PrinterSelector
                    label={<>KOT Printer <span style={{ color: 'var(--color-text-light)', fontWeight: 400 }}>(Optional)</span></> as unknown as string}
                    name="kotPrinter"
                    value={formData.kotPrinter}
                    helperText={formData.kotOnBillPrinter ? 'Using bill printer for KOT (see toggle below)' : 'If empty, KOT print will be skipped'}
                    disabled={formData.kotOnBillPrinter}
                />
            </div>

            {/* KOT on Bill Printer toggle — always visible for flexibility */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: formData.kotOnBillPrinter ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${formData.kotOnBillPrinter ? '#bfdbfe' : '#e2e8f0'}`,
                borderRadius: '8px',
                marginTop: '0.5rem',
                marginBottom: '1.5rem',
            }}>
                <input
                    type="checkbox"
                    id="kotOnBillPrinter"
                    name="kotOnBillPrinter"
                    checked={!!formData.kotOnBillPrinter}
                    onChange={handleChange}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="kotOnBillPrinter" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}>
                    Print KOT on Bill Printer
                    {onlyOnePrinter && (
                        <span style={{
                            marginLeft: '8px',
                            fontSize: '0.75rem',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            borderRadius: '4px',
                            padding: '1px 6px',
                            fontWeight: 400,
                        }}>
                            Recommended (only 1 printer detected)
                        </span>
                    )}
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginLeft: 'auto' }}>
                    Sends both bill &amp; KOT to {formData.billPrinter || 'the bill printer'}
                </span>
            </div>

            {/* ── Print Format ────────────────────────────────────────────── */}
            <h2 className="section-title" style={{ marginTop: '0.5rem' }}>Print Format</h2>
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

            {/* ── Actions ─────────────────────────────────────────────────── */}
            <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn-secondary" onClick={handleTestPrint} disabled={!formData.billPrinter && !serviceOnline}>
                        <FileText size={16} style={{ marginRight: '8px' }} /> Test Bill Print
                    </button>
                    {(formData.kotOnBillPrinter || effectiveKOTPrinter.trim()) && (
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

            {/* ── Service install help ─────────────────────────────────────── */}
            {!serviceOnline && serviceOnline !== null && (
                <details style={{
                    marginTop: '1.5rem',
                    padding: '14px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-light)',
                }}>
                    <summary style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--color-text)', marginBottom: '8px' }}>
                        📋 How to install ArambhPrinterService
                    </summary>
                    <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.8' }}>
                        <li>Click <strong>Download Service</strong> above</li>
                        <li>Extract the ZIP to any folder (e.g. <code>C:\ArambhPrinter</code>)</li>
                        <li>Make sure <strong>Node.js</strong> is installed → <a href="https://nodejs.org" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>nodejs.org</a></li>
                        <li>Right-click <strong>install.bat</strong> → <em>"Run as administrator"</em></li>
                        <li>Open terminal and run <strong>node install-service.js</strong></li>
                        <li>Come back here and click <strong>Refresh</strong></li>
                    </ol>
                    <p style={{ marginTop: '8px' }}>
                        💡 <strong>Tip:</strong> Install <a href="https://www.sumatrapdfreader.org/" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>SumatraPDF</a> for the most reliable silent printing on thermal printers.
                    </p>
                </details>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PrinterSettings;
