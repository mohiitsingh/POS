/**
 * printBill.ts
 *
 * Printing strategy:
 *  1. Try ArambhPrinterService (ws://localhost:9120) → silent, no popup
 *  2. If service unavailable → fall back to browser window.print() dialog
 */

// ─── Service Communication ────────────────────────────────────────────────────

const SERVICE_URL = 'ws://localhost:9120';
const CONNECT_TIMEOUT_MS = 1500; // how long to wait for service before falling back

/** Returns a short-lived WebSocket connected to ArambhPrinterService, or null on failure */
function connectToService(): Promise<WebSocket | null> {
    return new Promise((resolve) => {
        const ws = new WebSocket(SERVICE_URL);
        const timer = setTimeout(() => {
            ws.close();
            resolve(null);
        }, CONNECT_TIMEOUT_MS);

        ws.onopen = () => {
            clearTimeout(timer);
            resolve(ws);
        };
        ws.onerror = () => {
            clearTimeout(timer);
            resolve(null);
        };
    });
}

/** Sends a print action to the service and waits for acknowledgement */
function sendToPrinter(ws: WebSocket, payload: object): Promise<boolean> {
    return new Promise((resolve) => {
        const timer = setTimeout(() => resolve(false), 15000);
        ws.onmessage = (evt) => {
            clearTimeout(timer);
            try {
                const res = JSON.parse(evt.data as string);
                resolve(res.success === true);
            } catch { resolve(false); }
        };
        ws.send(JSON.stringify(payload));
    });
}

/**
 * Fetches the list of installed printers from ArambhPrinterService.
 * Returns empty array if service is not running.
 */
export async function getServicePrinters(): Promise<string[]> {
    const ws = await connectToService();
    if (!ws) return [];
    try {
        return await new Promise<string[]>((resolve) => {
            const timer = setTimeout(() => { ws.close(); resolve([]); }, 5000);
            ws.onmessage = (evt) => {
                clearTimeout(timer);
                try {
                    const res = JSON.parse(evt.data as string);
                    resolve(res.printers || []);
                } catch { resolve([]); }
                ws.close();
            };
            ws.send(JSON.stringify({ action: 'list-printers' }));
        });
    } catch { return []; }
}

/**
 * Checks if ArambhPrinterService is running.
 */
export async function isServiceRunning(): Promise<boolean> {
    const ws = await connectToService();
    if (!ws) return false;
    try {
        const ok = await sendToPrinter(ws, { action: 'ping' });
        ws.close();
        return ok;
    } catch { return false; }
}

// ─── HTML Generation ──────────────────────────────────────────────────────────

export interface BillPrintData {
    businessName: string;
    businessAddress: string;
    businessPhone?: string;
    gstNo?: string;
    fssaiNo?: string;
    orderDate: string; // ISO string
    diningType: string;
    tableNo?: string;
    tokenNumber: number;
    orderId: string;
    paymentMethod: 'Cash' | 'Online';
    items: { name: string; quantity: number; price: number }[];
    subtotal: number;
    discount: number;
    taxLabel: string;  // e.g. "Tax (5%)" or "Tax (Fixed)"
    taxAmount: number;
    roundOff: number;
    grandTotal: number;
    paperSize: '58mm' | '80mm';
    fontSize: 'small' | 'medium' | 'large';
}

const fontSizeMap = {
    small: '11px',
    medium: '13px',
    large: '15px',
};

function formatDateTime(iso: string): string {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${date}  ${time}`;
}

function shortId(id: string): string {
    return '#' + id.slice(0, 8).toUpperCase();
}

function buildBillHtml(data: BillPrintData): string {
    const pageWidth = data.paperSize === '58mm' ? '58mm' : '80mm';
    const contentWidth = data.paperSize === '58mm' ? '46mm' : '72mm'; // safe printable width
    const fs = fontSizeMap[data.fontSize];

    const itemRows = data.items.map((item, idx) => {
        const amount = item.price * item.quantity;
        return `
        <tr>
            <td style="padding:2px 0;">${idx + 1}</td>
            <td style="padding:2px 4px;">${item.name}</td>
            <td style="text-align:center;padding:2px 0;">${item.quantity}</td>
            <td style="text-align:right;padding:2px 0;">${item.price.toFixed(2)}</td>
            <td style="text-align:right;padding:2px 0;">${amount.toFixed(2)}</td>
        </tr>`;
    }).join('');

    const hr = `<div style="border-top:1px dashed #000;margin:6px 0;"></div>`;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Bill ${shortId(data.orderId)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; word-wrap: break-word; }
  body {
    font-family: 'Courier New', monospace;
    font-size: ${fs};
    width: ${contentWidth}; /* strictly constrain to printable area */
    max-width: 100%;
    margin: 0 auto;
    padding: 8px 0;
    color: #000;
    background: #fff;
  }
  .center { text-align: center; }
  .right  { text-align: right; }
  .bold   { font-weight: bold; }
  .large  { font-size: calc(${fs} + 3px); }
  .small  { font-size: calc(${fs} - 2px); }
  table   { width: 100%; border-collapse: collapse; }
  td      { vertical-align: top; }
  .summary-row { display: flex; justify-content: space-between; padding: 2px 0; }
  .total-row   { font-weight: bold; font-size: calc(${fs} + 2px); border-top: 1px solid #000; margin-top: 4px; padding-top: 4px; }
  @media print {
    @page { margin: 0; size: ${pageWidth} auto; }
    body  { margin: 0 auto; padding: 4px 0; }
  }
</style>
</head>
<body>

<!-- HEADER -->
<div class="center bold large">${data.businessName}</div>
${data.businessAddress ? `<div class="center small">${data.businessAddress}</div>` : ''}
${data.businessPhone ? `<div class="center small">📞 ${data.businessPhone}</div>` : ''}
${data.gstNo ? `<div class="center small">GST: ${data.gstNo}</div>` : ''}
${hr}

<!-- BILL META -->
<div class="summary-row"><span>Date:</span><span>${formatDateTime(data.orderDate)}</span></div>
<div class="summary-row"><span>Dining:</span><span>${data.diningType}</span></div>
${data.tableNo ? `<div class="summary-row"><span>Table:</span><span>${data.tableNo}</span></div>` : ''}
<div class="summary-row"><span>Token No:</span><span><b>${data.tokenNumber}</b></span></div>
<div class="summary-row"><span>Bill No:</span><span>${shortId(data.orderId)}</span></div>
<div class="summary-row"><span>Paid via:</span><span>${data.paymentMethod}</span></div>
${hr}

<!-- ITEMS TABLE -->
<table>
  <thead>
    <tr class="bold">
      <td>#</td>
      <td>Item</td>
      <td style="text-align:center;">Qty</td>
      <td style="text-align:right;">Rate</td>
      <td style="text-align:right;">Amt</td>
    </tr>
  </thead>
  <tbody>
    ${itemRows}
  </tbody>
</table>
${hr}

<!-- AMOUNTS -->
<div class="summary-row"><span>Subtotal:</span><span>&#8377;${data.subtotal.toFixed(2)}</span></div>
${data.discount > 0 ? `<div class="summary-row"><span>Discount:</span><span>-&#8377;${data.discount.toFixed(2)}</span></div>` : ''}
${data.taxAmount > 0 ? `<div class="summary-row"><span>${data.taxLabel}:</span><span>&#8377;${data.taxAmount.toFixed(2)}</span></div>` : ''}
${data.roundOff !== 0 ? `<div class="summary-row small"><span>Round off:</span><span>${data.roundOff > 0 ? '+' : ''}&#8377;${data.roundOff.toFixed(2)}</span></div>` : ''}
<div class="summary-row total-row"><span>Grand Total:</span><span>&#8377;${data.grandTotal}</span></div>

${data.fssaiNo ? `${hr}<div class="center small">FSSAI: ${data.fssaiNo}</div>` : ''}
${hr}

<!-- FOOTER -->
<div class="center bold" style="margin-top:8px;">Thank You !! Visit Us Again.</div>

</body>
</html>`;
}

// ─── KOT ─────────────────────────────────────────────────────────────────────

export interface KOTData {
    tokenNumber: number;
    diningType: string;
    tableNo?: string;
    items: { name: string; quantity: number }[];
    paperSize: '58mm' | '80mm';
    fontSize: 'small' | 'medium' | 'large';
}

function buildKOTHtml(data: KOTData): string {
    const pageWidth = data.paperSize === '58mm' ? '58mm' : '80mm';
    const contentWidth = data.paperSize === '58mm' ? '46mm' : '72mm'; // safe printable width
    const fontMap = { small: '11px', medium: '13px', large: '15px' };
    const fs = fontMap[data.fontSize];

    const itemRows = data.items.map((item, idx) => `
        <tr>
            <td style="padding:3px 0;">${idx + 1}</td>
            <td style="padding:3px 6px;font-weight:bold;">${item.name}</td>
            <td style="text-align:center;padding:3px 0;font-size:calc(${fs} + 2px);font-weight:bold;">x${item.quantity}</td>
        </tr>`).join('');

    const hr = `<div style="border-top:1px dashed #000;margin:6px 0;"></div>`;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>KOT - Token ${data.tokenNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; word-wrap: break-word; }
  body {
    font-family: 'Courier New', monospace;
    font-size: ${fs};
    width: ${contentWidth}; /* strictly constrain to printable area */
    max-width: 100%;
    margin: 0 auto;
    padding: 8px 0;
    color: #000;
    background: #fff;
  }
  .center { text-align: center; }
  .bold   { font-weight: bold; }
  .large  { font-size: calc(${fs} + 4px); }
  table   { width: 100%; border-collapse: collapse; }
  td      { vertical-align: middle; }
  @media print {
    @page { margin: 0; size: ${pageWidth} auto; }
    body  { margin: 0 auto; padding: 4px 0; }
  }
</style>
</head>
<body>

<!-- KOT HEADER -->
<div class="center bold" style="font-size:calc(${fs} + 2px);letter-spacing:2px;">-- KOT --</div>
${hr}
<div style="display:flex;justify-content:space-between;">
    <span class="bold">Token:</span>
    <span class="bold large">${data.tokenNumber}</span>
</div>
<div style="display:flex;justify-content:space-between;margin-top:4px;">
    <span class="bold">Type:</span>
    <span>${data.diningType}</span>
</div>
${data.tableNo ? `<div style="display:flex;justify-content:space-between;margin-top:4px;"><span class="bold">Table:</span><span>${data.tableNo}</span></div>` : ''}
${hr}

<!-- ITEMS -->
<table>
  <thead>
    <tr class="bold">
      <td>#</td>
      <td>Item</td>
      <td style="text-align:center;">Qty</td>
    </tr>
  </thead>
  <tbody>
    ${itemRows}
  </tbody>
</table>
${hr}

</body>
</html>`;
}

// ─── Browser Fallback (original behavior) ────────────────────────────────────

function openPrintWindow(html: string): void {
    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.onload = () => { w.focus(); w.print(); };
    setTimeout(() => {
        try { w.focus(); w.print(); } catch { /* already printed */ }
    }, 400);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Prints a bill — silently via ArambhPrinterService if running, else browser dialog.
 * @param data       Bill data
 * @param printerName  Name of printer from service (pass empty string to use browser fallback)
 */
export async function printBill(data: BillPrintData, printerName?: string): Promise<void> {
    const html = buildBillHtml(data);

    if (printerName && printerName.trim()) {
        const ws = await connectToService();
        if (ws) {
            const ok = await sendToPrinter(ws, { action: 'print-bill', printer: printerName, html });
            ws.close();
            if (ok) return; // ✅ Printed silently
        }
    }

    // Fallback: browser print dialog
    openPrintWindow(html);
}

/**
 * Prints a KOT — silently via ArambhPrinterService if running, else browser dialog.
 * @param data         KOT data
 * @param printerName  Name of KOT printer (or bill printer if kotOnBillPrinter is true)
 */
export async function printKOT(data: KOTData, printerName?: string): Promise<void> {
    const html = buildKOTHtml(data);

    if (printerName && printerName.trim()) {
        const ws = await connectToService();
        if (ws) {
            const ok = await sendToPrinter(ws, { action: 'print-kot', printer: printerName, html });
            ws.close();
            if (ok) return; // ✅ Printed silently
        }
    }

    // Fallback: browser print dialog
    openPrintWindow(html);
}
