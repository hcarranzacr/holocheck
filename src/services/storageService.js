/**
 * Storage Service for HoloCheck Biometric System
 * Manages persistent storage of biometric analysis results with timestamps
 * Supports both localStorage and future database integration
 */

import timestampService from './timestampService.js';

class StorageService {
  constructor() {
    this.storageKey = 'holoccheck_biometric_data';
    this.userStorageKey = 'holoccheck_user_data';
    this.settingsKey = 'holoccheck_settings';
    
    // Initialize storage structure if not exists
    this.initializeStorage();
  }

  /**
   * Initialize storage structure
   */
  initializeStorage() {
    if (!this.getStorageData()) {
      const initialData = {
        version: '1.0',
        created: timestampService.generateTimestamp(),
        users: {},
        globalSettings: {
          dataRetentionDays: 365,
          maxAnalysisPerUser: 1000,
          enableDataExport: true
        }
      };
      this.setStorageData(initialData);
    }
  }

  /**
   * Get raw storage data
   * @returns {object|null} Storage data or null if not found
   */
  getStorageData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading storage data:', error);
      return null;
    }
  }

  /**
   * Set raw storage data
   * @param {object} data - Data to store
   */
  setStorageData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving storage data:', error);
    }
  }

  /**
   * Save biometric analysis result
   * @param {string} userId - User identifier
   * @param {object} analysisResult - Analysis result from OpenAI
   * @param {object} biometricData - Raw biometric data (images, audio)
   * @returns {string} Generated timestamp for the analysis
   */
  saveAnalysis(userId, analysisResult, biometricData = {}) {
    const timestamp = timestampService.generateTimestamp();
    const storageData = this.getStorageData();
    
    if (!storageData.users[userId]) {
      storageData.users[userId] = {
        created: timestamp,
        analyses: {},
        profile: {},
        statistics: {
          totalAnalyses: 0,
          lastAnalysis: null,
          riskTrends: []
        }
      };
    }

    // Prepare analysis record
    const analysisRecord = {
      timestamp,
      sessionId: timestampService.generateSessionId(),
      analysisResult,
      biometricData: {
        hasImage: !!biometricData.image,
        hasAudio: !!biometricData.audio,
        imageSize: biometricData.image ? biometricData.image.size : 0,
        audioSize: biometricData.audio ? biometricData.audio.size : 0,
        audioDuration: biometricData.audioDuration || 0
      },
      metadata: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    // Store analysis
    storageData.users[userId].analyses[timestamp] = analysisRecord;
    
    // Update user statistics
    storageData.users[userId].statistics.totalAnalyses++;
    storageData.users[userId].statistics.lastAnalysis = timestamp;
    
    // Update risk trends (keep last 30 analyses)
    const riskTrends = storageData.users[userId].statistics.riskTrends;
    riskTrends.push({
      timestamp,
      overallRisk: analysisResult.overallRisk || 'medium',
      riskScore: analysisResult.riskScore || 50
    });
    
    // Keep only last 30 trends
    if (riskTrends.length > 30) {
      storageData.users[userId].statistics.riskTrends = riskTrends.slice(-30);
    }

    this.setStorageData(storageData);
    
    // Clean old data if needed
    this.cleanOldData(userId);
    
    return timestamp;
  }

  /**
   * Get user's analysis history
   * @param {string} userId - User identifier
   * @param {object} options - Query options
   * @returns {array} Array of analysis records
   */
  getUserAnalyses(userId, options = {}) {
    const storageData = this.getStorageData();
    const userData = storageData?.users?.[userId];
    
    if (!userData || !userData.analyses) {
      return [];
    }

    let analyses = Object.values(userData.analyses);
    
    // Apply filters
    if (options.limit) {
      analyses = analyses.slice(-options.limit);
    }
    
    if (options.fromDate) {
      analyses = analyses.filter(analysis => 
        timestampService.parseTimestamp(analysis.timestamp).date >= options.fromDate
      );
    }
    
    if (options.toDate) {
      analyses = analyses.filter(analysis => 
        timestampService.parseTimestamp(analysis.timestamp).date <= options.toDate
      );
    }
    
    if (options.riskLevel) {
      analyses = analyses.filter(analysis => 
        analysis.analysisResult?.overallRisk === options.riskLevel
      );
    }

    // Sort by timestamp (newest first)
    const timestamps = analyses.map(a => a.timestamp);
    const sortedTimestamps = timestampService.sortTimestamps(timestamps);
    
    return sortedTimestamps.map(timestamp => 
      userData.analyses[timestamp]
    );
  }

  /**
   * Get specific analysis by timestamp
   * @param {string} userId - User identifier
   * @param {string} timestamp - Analysis timestamp
   * @returns {object|null} Analysis record or null
   */
  getAnalysis(userId, timestamp) {
    const storageData = this.getStorageData();
    return storageData?.users?.[userId]?.analyses?.[timestamp] || null;
  }

  /**
   * Get user statistics
   * @param {string} userId - User identifier
   * @returns {object} User statistics
   */
  getUserStatistics(userId) {
    const storageData = this.getStorageData();
    const userData = storageData?.users?.[userId];
    
    if (!userData) {
      return {
        totalAnalyses: 0,
        lastAnalysis: null,
        riskTrends: [],
        averageRisk: 'unknown',
        improvementTrend: 'stable'
      };
    }

    const stats = userData.statistics;
    const analyses = Object.values(userData.analyses);
    
    // Calculate average risk score
    const riskScores = analyses
      .map(a => a.analysisResult?.riskScore)
      .filter(score => typeof score === 'number');
    
    const averageRiskScore = riskScores.length > 0 
      ? riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length
      : 50;

    // Determine improvement trend
    let improvementTrend = 'stable';
    if (stats.riskTrends.length >= 3) {
      const recent = stats.riskTrends.slice(-3);
      const scores = recent.map(t => t.riskScore);
      const firstScore = scores[0];
      const lastScore = scores[scores.length - 1];
      
      if (lastScore < firstScore - 5) {
        improvementTrend = 'improving';
      } else if (lastScore > firstScore + 5) {
        improvementTrend = 'declining';
      }
    }

    return {
      ...stats,
      averageRiskScore,
      averageRisk: this.getRiskLevel(averageRiskScore),
      improvementTrend,
      analysesThisWeek: analyses.filter(a => 
        timestampService.isThisWeek(a.timestamp)
      ).length,
      analysesToday: analyses.filter(a => 
        timestampService.isToday(a.timestamp)
      ).length
    };
  }

  /**
   * Get risk level from score
   * @param {number} score - Risk score (0-100)
   * @returns {string} Risk level
   */
  getRiskLevel(score) {
    if (score <= 30) return 'low';
    if (score <= 70) return 'medium';
    return 'high';
  }

  /**
   * Delete analysis
   * @param {string} userId - User identifier
   * @param {string} timestamp - Analysis timestamp
   * @returns {boolean} Success status
   */
  deleteAnalysis(userId, timestamp) {
    const storageData = this.getStorageData();
    const userData = storageData?.users?.[userId];
    
    if (!userData || !userData.analyses[timestamp]) {
      return false;
    }

    delete userData.analyses[timestamp];
    userData.statistics.totalAnalyses = Math.max(0, userData.statistics.totalAnalyses - 1);
    
    // Update risk trends
    userData.statistics.riskTrends = userData.statistics.riskTrends.filter(
      trend => trend.timestamp !== timestamp
    );

    this.setStorageData(storageData);
    return true;
  }

  /**
   * Clean old data based on retention policy
   * @param {string} userId - User identifier
   */
  cleanOldData(userId) {
    const storageData = this.getStorageData();
    const userData = storageData?.users?.[userId];
    const settings = storageData.globalSettings;
    
    if (!userData) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - settings.dataRetentionDays);

    // Clean old analyses
    const analyses = userData.analyses;
    let deletedCount = 0;
    
    Object.keys(analyses).forEach(timestamp => {
      const analysisDate = timestampService.parseTimestamp(timestamp).date;
      if (analysisDate < cutoffDate) {
        delete analyses[timestamp];
        deletedCount++;
      }
    });

    // Enforce max analyses limit
    const analysisCount = Object.keys(analyses).length;
    if (analysisCount > settings.maxAnalysisPerUser) {
      const timestamps = Object.keys(analyses);
      const sortedTimestamps = timestampService.sortTimestamps(timestamps);
      const toDelete = sortedTimestamps.slice(settings.maxAnalysisPerUser);
      
      toDelete.forEach(timestamp => {
        delete analyses[timestamp];
        deletedCount++;
      });
    }

    if (deletedCount > 0) {
      userData.statistics.totalAnalyses = Object.keys(analyses).length;
      this.setStorageData(storageData);
      console.log(`Cleaned ${deletedCount} old analyses for user ${userId}`);
    }
  }

  /**
   * Export user data
   * @param {string} userId - User identifier
   * @returns {object} Exportable user data
   */
  exportUserData(userId) {
    const storageData = this.getStorageData();
    const userData = storageData?.users?.[userId];
    
    if (!userData) {
      return null;
    }

    return {
      exportDate: new Date().toISOString(),
      userId,
      profile: userData.profile,
      statistics: userData.statistics,
      analyses: Object.values(userData.analyses).map(analysis => ({
        timestamp: analysis.timestamp,
        readableDate: timestampService.getReadableDate(analysis.timestamp),
        analysisResult: analysis.analysisResult,
        metadata: analysis.metadata
      }))
    };
  }

  /**
   * Get storage usage statistics
   * @returns {object} Storage usage info
   */
  getStorageInfo() {
    const storageData = this.getStorageData();
    const dataString = JSON.stringify(storageData);
    const sizeBytes = new Blob([dataString]).size;
    const sizeKB = Math.round(sizeBytes / 1024);
    const sizeMB = Math.round(sizeKB / 1024 * 100) / 100;

    const userCount = Object.keys(storageData.users).length;
    const totalAnalyses = Object.values(storageData.users)
      .reduce((sum, user) => sum + user.statistics.totalAnalyses, 0);

    return {
      sizeBytes,
      sizeKB,
      sizeMB,
      userCount,
      totalAnalyses,
      version: storageData.version,
      created: storageData.created
    };
  }

  /**
   * Clear all data (use with caution)
   */
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    this.initializeStorage();
  }
}

// Create singleton instance
const storageService = new StorageService();

export default storageService;

// Export class for testing
export { StorageService };

// Example usage:
// import storageService from './storageService';
// 
// // Save analysis
// const timestamp = storageService.saveAnalysis('user123', {
//   overallRisk: 'medium',
//   riskScore: 65,
//   biomarkers: { stress: 'high', fatigue: 'low' }
// }, {
//   image: imageBlob,
//   audio: audioBlob,
//   audioDuration: 25
// });
// 
// // Get user analyses
// const analyses = storageService.getUserAnalyses('user123', { limit: 10 });
// 
// // Get statistics
// const stats = storageService.getUserStatistics('user123');