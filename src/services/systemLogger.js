/**
 * System Logger Service
 * Provides comprehensive logging functionality for medical-grade transparency
 */

class SystemLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      type,
      id: Date.now() + Math.random()
    };

    // Add to internal storage
    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with appropriate styling
    const consoleMethod = this.getConsoleMethod(type);
    const formattedMessage = `[${type.toUpperCase()}] ${new Date().toLocaleTimeString()} - ${message}`;
    
    consoleMethod(formattedMessage);
  }

  getConsoleMethod(type) {
    switch (type) {
      case 'error':
        return console.error;
      case 'warn':
        return console.warn;
      case 'success':
        return console.log;
      case 'debug':
        return console.debug;
      default:
        return console.log;
    }
  }

  info(message) {
    this.log(message, 'info');
  }

  warn(message) {
    this.log(message, 'warn');
  }

  error(message) {
    this.log(message, 'error');
  }

  success(message) {
    this.log(message, 'success');
  }

  debug(message) {
    this.log(message, 'debug');
  }

  getLogs(type = null) {
    if (type) {
      return this.logs.filter(log => log.type === type);
    }
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    console.clear();
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
const systemLogger = new SystemLogger();

// Export both named and default exports for compatibility
export { systemLogger };
export default systemLogger;