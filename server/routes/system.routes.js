const express = require('express');
const fs = require('fs');
const { appLogPath, errorLogPath } = require('../utils/logger.util');

const router = express.Router();

router.get('/logs', (req, res) => {
    const secret = req.query.secret;
    const expectedSecret = process.env.ADMIN_LOG_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
        return res.status(403).send('Forbidden: Invalid or missing secret key.');
    }

    // Read the last 15000 characters to prevent crashing on huge log files
    const readLastChunk = (filePath) => {
        if (!fs.existsSync(filePath)) return 'No logs yet.';
        const stats = fs.statSync(filePath);
        const chunkSize = Math.min(stats.size, 15000);
        const buffer = Buffer.alloc(chunkSize);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, chunkSize, stats.size - chunkSize);
        fs.closeSync(fd);
        return buffer.toString('utf8');
    };

    const appLogs = readLastChunk(appLogPath);
    const errorLogs = readLastChunk(errorLogPath);

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>System Logs</title>
        <style>
            body { font-family: 'Courier New', Courier, monospace; background: #1e1e1e; color: #d4d4d4; margin: 0; padding: 20px; }
            h1 { color: #9cdcfe; margin-top: 0; }
            .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
            .tab { padding: 10px 20px; background: #2d2d2d; border: 1px solid #444; border-radius: 4px; cursor: pointer; color: #d4d4d4; }
            .tab.active { background: #007acc; border-color: #007acc; color: white; }
            .log-container { background: #000; padding: 15px; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; max-height: 75vh; overflow-y: auto; border: 1px solid #333; display: none; font-size: 14px; line-height: 1.5; }
            .log-container.active { display: block; }
            .error-text { color: #f44747; }
        </style>
    </head>
    <body>
        <h1>Server Logs</h1>
        <div class="tabs">
            <div class="tab active" onclick="switchTab('app')">Application Logs</div>
            <div class="tab" onclick="switchTab('error')" style="color: #f44747;">Error Logs</div>
        </div>
        
        <div id="app" class="log-container active">${appLogs || 'Empty'}</div>
        <div id="error" class="log-container error-text">${errorLogs || 'Empty'}</div>

        <script>
            function switchTab(tabId) {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.log-container').forEach(c => c.classList.remove('active'));
                
                event.target.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                
                // Scroll to bottom
                const container = document.getElementById(tabId);
                container.scrollTop = container.scrollHeight;
            }
            // Auto scroll to bottom on load
            window.onload = () => {
                const appContainer = document.getElementById('app');
                appContainer.scrollTop = appContainer.scrollHeight;
            };
        </script>
    </body>
    </html>
    `;

    res.send(html);
});

module.exports = router;
