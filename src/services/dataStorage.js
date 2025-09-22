/**
 * Data Storage Service
 * Handles local storage of biometric evaluations with fallback strategies
 */

const STORAGE_KEY = 'holocheck_evaluations';
const MAX_EVALUATIONS = 100;

class DataStorageService {
  constructor() {
    this.storageAvailable = this.checkStorageAvailability();
    this.memoryStorage = new Map(); // Fallback storage
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} True if localStorage is available
   */
  checkStorageAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage not available, using memory storage');
      return false;
    }
  }

  /**
   * Generate a unique ID for an evaluation
   * @returns {string} Unique evaluation ID
   */
  generateEvaluationId() {
    return `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save a biometric evaluation
   * @param {Object} evaluationData - The evaluation data to save
   * @returns {Promise<boolean>} Success status
   */
  async saveEvaluation(evaluationData) {
    try {
      const evaluation = {
        id: this.generateEvaluationId(),
        timestamp: new Date().toISOString(),
        data: evaluationData,
        version: 'v1.1.16-STORAGE-FIX'
      };

      if (this.storageAvailable) {
        // Use localStorage
        const existingData = this.getAllEvaluations();
        existingData.push(evaluation);
        
        // Keep only the last MAX_EVALUATIONS
        const trimmedData = existingData.slice(-MAX_EVALUATIONS);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedData));
        console.log('✅ Evaluation saved to localStorage:', evaluation.id);
      } else {
        // Use memory storage
        this.memoryStorage.set(evaluation.id, evaluation);
        
        // Trim memory storage if needed
        if (this.memoryStorage.size > MAX_EVALUATIONS) {
          const keys = Array.from(this.memoryStorage.keys());
          const oldestKey = keys[0];
          this.memoryStorage.delete(oldestKey);
        }
        
        console.log('✅ Evaluation saved to memory storage:', evaluation.id);
      }

      return true;
    } catch (error) {
      console.error('❌ Error saving evaluation:', error);
      return false;
    }
  }

  /**
   * Get all stored evaluations
   * @returns {Array} Array of evaluations
   */
  getAllEvaluations() {
    try {
      if (this.storageAvailable) {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } else {
        return Array.from(this.memoryStorage.values());
      }
    } catch (error) {
      console.error('❌ Error retrieving evaluations:', error);
      return [];
    }
  }

  /**
   * Get a specific evaluation by ID
   * @param {string} evaluationId - The evaluation ID
   * @returns {Object|null} The evaluation or null if not found
   */
  getEvaluationById(evaluationId) {
    try {
      if (this.storageAvailable) {
        const evaluations = this.getAllEvaluations();
        return evaluations.find(evaluation => evaluation.id === evaluationId) || null;
      } else {
        return this.memoryStorage.get(evaluationId) || null;
      }
    } catch (error) {
      console.error('❌ Error retrieving evaluation:', error);
      return null;
    }
  }

  /**
   * Get recent evaluations (last N evaluations)
   * @param {number} count - Number of recent evaluations to retrieve
   * @returns {Array} Array of recent evaluations
   */
  getRecentEvaluations(count = 10) {
    try {
      const evaluations = this.getAllEvaluations();
      return evaluations
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, count);
    } catch (error) {
      console.error('❌ Error retrieving recent evaluations:', error);
      return [];
    }
  }

  /**
   * Search evaluations by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Array of evaluations in date range
   */
  getEvaluationsByDateRange(startDate, endDate) {
    try {
      const evaluations = this.getAllEvaluations();
      return evaluations.filter(evaluation => {
        const evalDate = new Date(evaluation.timestamp);
        return evalDate >= startDate && evalDate <= endDate;
      });
    } catch (error) {
      console.error('❌ Error searching evaluations by date:', error);
      return [];
    }
  }

  /**
   * Get storage statistics
   * @returns {Object} Storage statistics
   */
  getStorageStats() {
    try {
      const evaluations = this.getAllEvaluations();
      const totalEvaluations = evaluations.length;
      const oldestEvaluation = evaluations.length > 0 ? 
        evaluations.reduce((oldest, current) => 
          new Date(current.timestamp) < new Date(oldest.timestamp) ? current : oldest
        ) : null;
      const newestEvaluation = evaluations.length > 0 ? 
        evaluations.reduce((newest, current) => 
          new Date(current.timestamp) > new(newest.timestamp) ? current : newest
        ) : null;

      return {
        totalEvaluations,
        storageType: this.storageAvailable ? 'localStorage' : 'memory',
        oldestEvaluation: oldestEvaluation ? oldestEvaluation.timestamp : null,
        newestEvaluation: newestEvaluation ? newestEvaluation.timestamp : null,
        maxCapacity: MAX_EVALUATIONS
      };
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return {
        totalEvaluations: 0,
        storageType: 'unknown',
        oldestEvaluation: null,
        newestEvaluation: null,
        maxCapacity: MAX_EVALUATIONS
      };
    }
  }

  /**
   * Clear all stored evaluations
   * @returns {boolean} Success status
   */
  clearAllEvaluations() {
    try {
      if (this.storageAvailable) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        this.memoryStorage.clear();
      }
      console.log('✅ All evaluations cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing evaluations:', error);
      return false;
    }
  }

  /**
   * Export all evaluations as JSON
   * @returns {string} JSON string of all evaluations
   */
  exportEvaluations() {
    try {
      const evaluations = this.getAllEvaluations();
      return JSON.stringify({
        exportDate: new Date().toISOString(),
        version: 'v1.1.16-STORAGE-FIX',
        totalEvaluations: evaluations.length,
        evaluations: evaluations
      }, null, 2);
    } catch (error) {
      console.error('❌ Error exporting evaluations:', error);
      return JSON.stringify({ error: 'Export failed', message: error.message });
    }
  }
}

// Create and export singleton instance
const dataStorageService = new DataStorageService();
export default dataStorageService;