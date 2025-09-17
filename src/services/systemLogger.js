/**
 * System Logger Service - Comprehensive logging for medical-grade transparency
 */

class SystemLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.listeners = [];
    this.isEnabled = true;
    this.logLevels = {
      INFO: 'info',
      SUCCESS: 'success',
      WARNING: 'warning',
      ERROR: 'error',
      DEBUG: 'debug'
    };
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(logEntry) {
    this.listeners.forEach(listener => {
      try {
        listener(logEntry);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }

  createLogEntry(level, message, data = null) {
    const timestamp = new Date();
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      timeString: timestamp.toLocaleTimeString(),
      level,
      message,
      data,
      browser: this.getBrowserInfo(),
      url: window.location.href
    };

    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with styling
    this.outputToConsole(logEntry);
    
    // Notify UI listeners
    this.notifyListeners(logEntry);

    return logEntry;
  }

  log(message, data = null) {
    return this.createLogEntry(this.logLevels.INFO, message, data);
  }

  success(message, data = null) {
    return this.createLogEntry(this.logLevels.SUCCESS, message, data);
  }

  warning(message, data = null) {
    return this.createLogEntry(this.logLevels.WARNING, message, data);
  }

  error(message, data = null) {
    return this.createLogEntry(this.logLevels.ERROR, message, data);
  }

  debug(message, data = null) {
    return this.createLogEntry(this.logLevels.DEBUG, message, data);
  }

  outputToConsole(logEntry) {
    if (!this.isEnabled) return;

    const styles = {
      info: 'color: #3b82f6; font-weight: bold;',
      success: 'color: #16a34a; font-weight: bold;',
      warning: 'color: #d97706; font-weight: bold;',
      error: 'color: #dc2626; font-weight: bold;',
      debug: 'color: #6b7280; font-weight: normal;'
    };

    const style = styles[logEntry.level] || styles.info;
    const prefix = `[${logEntry.timeString}] HoloCheck:`;
    
    if (logEntry.data) {
      console.log(`%c${prefix} ${logEntry.message}`, style, logEntry.data);
    } else {
      console.log(`%c${prefix} ${logEntry.message}`, style);
    }
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';

    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
      version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Edg')) {
      browser = 'Edge';
      version = ua.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
    }

    return { browser, version, userAgent: ua };
  }

  // Medical-grade logging methods
  logPermissionRequest(type) {
    return this.log(`🔐 Solicitando permisos ${type}...`, {
      type,
      timestamp: Date.now(),
      browser: this.getBrowserInfo().browser
    });
  }

  logPermissionGranted(type, constraints) {
    return this.success(`✅ Permisos ${type} otorgados`, {
      type,
      constraints,
      browser: this.getBrowserInfo().browser
    });
  }

  logPermissionDenied(type, error) {
    return this.error(`❌ Permisos ${type} denegados`, {
      type,
      error: error.message,
      browser: this.getBrowserInfo().browser
    });
  }

  logDeviceActivated(type, deviceInfo) {
    return this.success(`📹 ${type} activado`, deviceInfo);
  }

  logRecordingStart(config) {
    return this.success('🔴 Iniciando grabación video + audio', config);
  }

  logRecordingProgress(progress) {
    return this.log(`⏱️ Grabando: ${progress.current}s / ${progress.total}s`, {
      progress: (progress.current / progress.total) * 100,
      remaining: progress.total - progress.current
    });
  }

  logAnalysisUpdate(type, data) {
    const icons = {
      rppg: '💓',
      voice: '🎵',
      face: '👤'
    };
    
    return this.log(`${icons[type] || '📊'} Análisis ${type}:`, data);
  }

  logBiometricData(biomarkers) {
    return this.log('📊 Marcadores biométricos actualizados', biomarkers);
  }

  logError(context, error) {
    return this.error(`❌ Error en ${context}`, {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  }

  logSystemInfo() {
    const info = {
      browser: this.getBrowserInfo(),
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink
      } : 'Unknown',
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };

    return this.log('🖥️ Información del sistema', info);
  }

  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      browser: this.getBrowserInfo(),
      logs: this.logs,
      summary: {
        total: this.logs.length,
        errors: this.logs.filter(log => log.level === 'error').length,
        warnings: this.logs.filter(log => log.level === 'warning').length,
        success: this.logs.filter(log => log.level === 'success').length
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  clearLogs() {
    const count = this.logs.length;
    this.logs = [];
    this.log(`🧹 Logs limpiados (${count} entradas eliminadas)`);
  }

  getLogs(level = null, limit = null) {
    let filteredLogs = level ? 
      this.logs.filter(log => log.level === level) : 
      this.logs;
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  getLogsSummary() {
    return {
      total: this.logs.length,
      byLevel: {
        info: this.logs.filter(log => log.level === 'info').length,
        success: this.logs.filter(log => log.level === 'success').length,
        warning: this.logs.filter(log => log.level === 'warning').length,
        error: this.logs.filter(log => log.level === 'error').length,
        debug: this.logs.filter(log => log.level === 'debug').length
      },
      latestError: this.logs.filter(log => log.level === 'error').slice(-1)[0],
      latestSuccess: this.logs.filter(log => log.level === 'success').slice(-1)[0]
    };
  }

  enable() {
    this.isEnabled = true;
    this.log('📝 Sistema de logs habilitado');
  }

  disable() {
    this.log('📝 Sistema de logs deshabilitado');
    this.isEnabled = false;
  }
}

// Create singleton instance
const systemLogger = new SystemLogger();

// Initialize system info
systemLogger.logSystemInfo();

export default systemLogger;