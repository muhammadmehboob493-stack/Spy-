const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

// Temporary storage path for Vercel environments
const DATA_FILE = '/tmp/targets.json';

// Function to read and filter data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        let data = JSON.parse(fs.readFileSync(DATA_FILE));
        // Filter out data older than 24 hours
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        return data.filter(t => (now - new Date(t.timestamp).getTime()) < oneDay);
    } catch (e) { 
        return []; 
    }
};

// Function to write data to the temporary file
const saveData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// 1. API Endpoint: Receives data from Sketchware Pro
app.post('/api', (req, res) => {
    const { model, id } = req.body;
    let targets = readData();
    
    // Add new target with timestamp for the 24-hour logic
    targets.push({ 
        model, 
        id, 
        timestamp: new Date().toISOString(),
        lastSeen: new Date().toLocaleString() 
    });
    
    saveData(targets);
    res.json({ status: "success", data: { model, id } });
});

// 2. Export Feature: Generates a CSV/Text report for download
app.get('/download', (req, res) => {
    const targets = readData();
    let content = "MODEL, DEVICE ID, CAPTURE TIME\n";
    targets.forEach(t => {
        content += `${t.model}, ${t.id}, ${t.lastSeen}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=nexus_pro_report.csv');
    res.status(200).send(content);
});

// 3. Web Dashboard UI
app.get('/', (req, res) => {
    const targets = readData();
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>NEXUS PRO Dashboard</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="background:#121212; color:#ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding:20px;">
            <div style="max-width:800px; margin:auto; border:1px solid #333; padding:30px; border-radius:15px; background:#1e1e1e; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                <h1 style="color:#00e676; margin-bottom:5px;">NEXUS PRO</h1>
                <p style="color:#888; margin-top:0;">Live Monitoring Console (24H Data Retention)</p>
                
                <hr style="border:0; border-top:1px solid #333; margin:20px 0;">
                
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h3 style="margin-bottom:0;">Online Targets</h3>
                        <span style="font-size:48px; font-weight:bold; color:#00e676;">${targets.length}</span>
                    </div>
                    <a href="/download" style="background:#2196F3; color:white; padding:12px 24px; text-shadow:none; text-decoration:none; border-radius:8px; font-weight:bold; transition: 0.3s;">
                        DOWNLOAD REPORT
                    </a>
                </div>

                <div style="margin-top:30px;">
                    <h4 style="color:#aaa; text-transform:uppercase; letter-spacing:1px;">Recent Activity</h4>
                    <ul style="list-style:none; padding:0; margin-top:15px;">
                        ${targets.length === 0 ? '<li style="color:#555;">No active targets found within the last 24 hours.</li>' : ''}
                        ${targets.reverse().map(t => `
                            <li style="background:#252525; margin-bottom:12px; padding:15px; border-radius:8px; border-left:5px solid #00e676; display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <strong style="font-size:1.1em;">${t.model}</strong><br>
                                    <code style="color:#00e676; font-size:0.9em;">ID: ${t.id}</code>
                                </div>
                                <div style="text-align:right;">
                                    <small style="color:#888; display:block;">Captured At</small>
                                    <small style="color:#bbb;">${t.lastSeen}</small>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            <p style="text-align:center; color:#444; font-size:12px; margin-top:20px;">Automated Cleanup Active: Data older than 24 hours is permanently deleted.</p>
        </body>
        </html>
    `);
});

module.exports = app;
