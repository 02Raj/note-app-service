const fs = require('fs');
const path = require('path');
const util = require('util');

const logsDir = path.join(__dirname, '..', '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const appLogStream = fs.createWriteStream(path.join(logsDir, 'app.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' });

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

function formatMessage(args) {
    return util.format.apply(null, args) + '\n';
}

function getTimestamp() {
    return new Date().toISOString() + ' - ';
}

// Override console.log
console.log = function (...args) {
    const message = getTimestamp() + formatMessage(args);
    appLogStream.write(message);
    originalConsoleLog.apply(console, args);
};

// Override console.error
console.error = function (...args) {
    const message = getTimestamp() + formatMessage(args);
    errorLogStream.write(message);
    originalConsoleError.apply(console, args);
};

module.exports = {
    appLogPath: path.join(logsDir, 'app.log'),
    errorLogPath: path.join(logsDir, 'error.log')
};
