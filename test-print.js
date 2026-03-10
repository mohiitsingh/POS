const { WebSocket } = require('ws');
const ws = new WebSocket('ws://127.0.0.1:9120');

ws.on('open', () => {
    console.log('Connected to service');
    ws.send(JSON.stringify({
        action: 'print-bill',
        printer: 'HPF8492E (HP Smart Tank 580-590 series)',
        html: '<html><body><h1>Test Print</h1></body></html>'
    }));
});

ws.on('message', (data) => {
    console.log('Received:', data.toString());
    ws.close();
});

ws.on('error', (err) => {
    console.error('Error:', err.message);
});
