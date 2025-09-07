/**
 * Timestamp Service for HoloCheck Biometric System
 * Generates unique timestamps in format: año-mes-día-hora-minuto-consecutivo
 * Example: 2025-01-15-14-30-001, 2025-01-15-14-30-002
 */

class TimestampService {
  constructor() {
    this.lastTimestamp = null;
    this.consecutiveCounter = 0;
  }

  /**
   * Generate unique timestamp with consecutive counter
   * @returns {string} Formatted timestamp: YYYY-MM-DD-HH-mm-XXX
   */
  generateTimestamp() {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    const baseTimestamp = `${year}-${month}-${day}-${hour}-${minute}`;
    
    // If same minute as last timestamp, increment counter
    if (this.lastTimestamp && this.lastTimestamp.startsWith(baseTimestamp)) {
      this.consecutiveCounter++;
    } else {
      this.consecutiveCounter = 1;
    }
    
    const consecutiveStr = String(this.consecutiveCounter).padStart(3, '0');
    const fullTimestamp = `${baseTimestamp}-${consecutiveStr}`;
    
    this.lastTimestamp = fullTimestamp;
    return fullTimestamp;
  }

  /**
   * Parse timestamp back to components
   * @param {string} timestamp - Formatted timestamp
   * @returns {object} Parsed components
   */
  parseTimestamp(timestamp) {
    const parts = timestamp.split('-');
    if (parts.length !== 6) {
      throw new Error('Invalid timestamp format');
    }

    return {
      year: parseInt(parts[0]),
      month: parseInt(parts[1]),
      day: parseInt(parts[2]),
      hour: parseInt(parts[3]),
      minute: parseInt(parts[4]),
      consecutive: parseInt(parts[5]),
      date: new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2]),
        parseInt(parts[3]),
        parseInt(parts[4])
      )
    };
  }

  /**
   * Get human-readable date from timestamp
   * @param {string} timestamp - Formatted timestamp
   * @returns {string} Human-readable date
   */
  getReadableDate(timestamp) {
    try {
      const parsed = this.parseTimestamp(timestamp);
      const date = parsed.date;
      
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Mexico_City'
      };
      
      return date.toLocaleDateString('es-MX', options);
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  /**
   * Get relative time from timestamp (e.g., "hace 2 horas")
   * @param {string} timestamp - Formatted timestamp
   * @returns {string} Relative time string
   */
  getRelativeTime(timestamp) {
    try {
      const parsed = this.parseTimestamp(timestamp);
      const date = parsed.date;
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) {
        return 'Ahora mismo';
      } else if (diffMinutes < 60) {
        return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
      } else if (diffHours < 24) {
        return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
      } else if (diffDays < 30) {
        return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
      } else {
        return this.getReadableDate(timestamp);
      }
    } catch (error) {
      return 'Tiempo desconocido';
    }
  }

  /**
   * Generate session ID based on current timestamp
   * @returns {string} Session ID
   */
  generateSessionId() {
    const timestamp = this.generateTimestamp();
    return `session_${timestamp}`;
  }

  /**
   * Get current date components for filtering
   * @returns {object} Current date components
   */
  getCurrentDateComponents() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes()
    };
  }

  /**
   * Check if timestamp is from today
   * @param {string} timestamp - Formatted timestamp
   * @returns {boolean} True if timestamp is from today
   */
  isToday(timestamp) {
    try {
      const parsed = this.parseTimestamp(timestamp);
      const now = new Date();
      
      return (
        parsed.year === now.getFullYear() &&
        parsed.month === now.getMonth() + 1 &&
        parsed.day === now.getDate()
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if timestamp is from this week
   * @param {string} timestamp - Formatted timestamp
   * @returns {boolean} True if timestamp is from this week
   */
  isThisWeek(timestamp) {
    try {
      const parsed = this.parseTimestamp(timestamp);
      const date = parsed.date;
      const now = new Date();
      
      // Get start of week (Monday)
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Get end of week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return date >= startOfWeek && date <= endOfWeek;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sort timestamps in descending order (newest first)
   * @param {string[]} timestamps - Array of timestamps
   * @returns {string[]} Sorted timestamps
   */
  sortTimestamps(timestamps) {
    return timestamps.sort((a, b) => {
      try {
        const dateA = this.parseTimestamp(a).date;
        const dateB = this.parseTimestamp(b).date;
        return dateB - dateA; // Descending order
      } catch (error) {
        return 0;
      }
    });
  }
}

// Create singleton instance
const timestampService = new TimestampService();

export default timestampService;

// Export class for testing
export { TimestampService };

// Example usage:
// import timestampService from './timestampService';
// 
// const timestamp = timestampService.generateTimestamp();
// console.log(timestamp); // "2025-01-15-14-30-001"
// 
// const readable = timestampService.getReadableDate(timestamp);
// console.log(readable); // "15 de enero de 2025 a las 14:30"
// 
// const relative = timestampService.getRelativeTime(timestamp);
// console.log(relative); // "Hace 5 minutos"