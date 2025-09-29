import { supabase } from './supabaseClient.js';
import { encryptPHI, decryptPHI } from '../../utils/encryption.js';
import { logAuditEvent, checkPermission, PERMISSION_LEVELS } from './authService.js';

/**
 * Analysis Results Service
 * Handles storage and retrieval of biometric analysis results
 */

// Save analysis results with risk assessment
export const saveAnalysisResults = async (userId, biometricDataId, analysisData) => {
  try {
    // Validate user permissions
    const hasPermission = await checkPermission(userId, PERMISSION_LEVELS.WRITE_OWN, 'analysis_results');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to save analysis results');
    }

    // Calculate expiration date (7 years for HIPAA compliance)
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 7);

    const { data, error } = await supabase
      .from('analysis_results')
      .insert({
        biometric_data_id: biometricDataId,
        user_id: userId,
        cardiovascular_metrics: analysisData.cardiovascular || {},
        voice_biomarkers: analysisData.voice || {},
        stress_indicators: analysisData.stress || {},
        risk_assessment: analysisData.riskLevel || 'low',
        clinical_recommendations: analysisData.recommendations || {},
        analysis_algorithm_version: analysisData.algorithmVersion || '1.0.0',
        confidence_score: analysisData.confidence || 0,
        processing_time_ms: analysisData.processingTime || 0,
        expires_at: expirationDate.toISOString()
      })
      .select();

    if (error) throw error;

    // Log audit event
    await logAuditEvent({
      user_id: userId,
      action: 'CREATE_ANALYSIS_RESULT',
      resource_type: 'analysis_results',
      resource_id: data[0]?.id,
      details: {
        biometric_data_id: biometricDataId,
        risk_level: analysisData.riskLevel,
        confidence: analysisData.confidence
      },
      success: true
    });

    return data[0];
  } catch (error) {
    console.error('Save analysis results error:', error);
    
    await logAuditEvent({
      user_id: userId,
      action: 'CREATE_ANALYSIS_RESULT_FAILED',
      resource_type: 'analysis_results',
      details: { error: error.message },
      success: false
    });
    
    throw error;
  }
};

// Get user's analysis history
export const getAnalysisHistory = async (userId, options = {}) => {
  try {
    // Validate user permissions
    const hasPermission = await checkPermission(userId, PERMISSION_LEVELS.READ_OWN, 'analysis_results');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to read analysis results');
    }

    let query = supabase
      .from('analysis_results')
      .select(`
        *,
        biometric_data:biometric_data_id (
          capture_timestamp,
          capture_quality_score,
          capture_device_info
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    if (options.riskLevel) {
      query = query.eq('risk_assessment', options.riskLevel);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Log audit event
    await logAuditEvent({
      user_id: userId,
      action: 'READ_ANALYSIS_HISTORY',
      resource_type: 'analysis_results',
      details: {
        records_count: data.length,
        filters: options
      },
      success: true
    });

    return data;
  } catch (error) {
    console.error('Get analysis history error:', error);
    
    await logAuditEvent({
      user_id: userId,
      action: 'READ_ANALYSIS_HISTORY_FAILED',
      resource_type: 'analysis_results',
      details: { error: error.message },
      success: false
    });
    
    throw error;
  }
};

// Get latest analysis result
export const getLatestAnalysis = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select(`
        *,
        biometric_data:biometric_data_id (
          capture_timestamp,
          capture_quality_score
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data[0] || null;
  } catch (error) {
    console.error('Get latest analysis error:', error);
    throw error;
  }
};

// Get analysis statistics for user
export const getAnalysisStatistics = async (userId, timeRange = '30d') => {
  try {
    const startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Calculate statistics
    const stats = {
      totalAnalyses: data.length,
      riskDistribution: {
        low: data.filter(r => r.risk_assessment === 'low').length,
        moderate: data.filter(r => r.risk_assessment === 'moderate').length,
        high: data.filter(r => r.risk_assessment === 'high').length,
        critical: data.filter(r => r.risk_assessment === 'critical').length
      },
      averageConfidence: data.length > 0 
        ? data.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / data.length 
        : 0,
      trends: calculateTrends(data)
    };

    return stats;
  } catch (error) {
    console.error('Get analysis statistics error:', error);
    throw error;
  }
};

// Helper function to calculate trends
const calculateTrends = (data) => {
  if (data.length < 2) return {};

  const sortedData = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
  // Calculate heart rate trend
  const heartRates = sortedData
    .map(r => r.cardiovascular_metrics?.heartRate)
    .filter(hr => hr !== undefined);
  
  const stressLevels = sortedData
    .map(r => r.stress_indicators?.stressLevel)
    .filter(sl => sl !== undefined);

  return {
    heartRate: {
      current: heartRates[heartRates.length - 1],
      previous: heartRates[heartRates.length - 2],
      trend: heartRates.length >= 2 
        ? (heartRates[heartRates.length - 1] > heartRates[heartRates.length - 2] ? 'up' : 'down')
        : 'stable'
    },
    stress: {
      current: stressLevels[stressLevels.length - 1],
      previous: stressLevels[stressLevels.length - 2],
      trend: stressLevels.length >= 2 
        ? (stressLevels[stressLevels.length - 1] > stressLevels[stressLevels.length - 2] ? 'up' : 'down')
        : 'stable'
    }
  };
};

export default {
  saveAnalysisResults,
  getAnalysisHistory,
  getLatestAnalysis,
  getAnalysisStatistics
};