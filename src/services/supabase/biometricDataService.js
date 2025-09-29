import { supabase } from './supabaseClient.js';
import { encryptPHI, decryptPHI } from '../../utils/encryption.js';
import { logAuditEvent, checkPermission, PERMISSION_LEVELS } from './authService.js';

/**
 * HIPAA-compliant biometric data service
 * Handles encrypted storage and retrieval of Protected Health Information (PHI)
 */

// Save biometric analysis results with encryption
export const saveBiometricData = async (userId, biometricData) => {
  try {
    // Validate user permissions
    const hasPermission = await checkPermission(userId, PERMISSION_LEVELS.WRITE_OWN, 'biometric_data');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to save biometric data');
    }

    // Encrypt PHI data
    const encryptedData = encryptPHI({
      heart_rate: biometricData.heartRate,
      heart_rate_variability: biometricData.heartRateVariability,
      blood_pressure_systolic: biometricData.bloodPressureSystolic,
      blood_pressure_diastolic: biometricData.bloodPressureDiastolic,
      respiratory_rate: biometricData.respiratoryRate,
      oxygen_saturation: biometricData.oxygenSaturation,
      stress_level: biometricData.stressLevel,
      fatigue_level: biometricData.fatigueLevel,
      emotional_state: biometricData.emotionalState,
      voice_analysis: biometricData.voiceAnalysis,
      facial_analysis: biometricData.facialAnalysis,
      raw_rppg_data: biometricData.rawRppgData,
      analysis_metadata: biometricData.analysisMetadata
    });

    // Calculate risk scores (non-PHI, can be stored unencrypted for aggregation)
    const riskScores = calculateRiskScores(biometricData);

    const { data, error } = await supabase
      .from('biometric_data')
      .insert({
        user_id: userId,
        session_id: biometricData.sessionId || generateSessionId(),
        encrypted_biometric_data: encryptedData,
        risk_score_cardiovascular: riskScores.cardiovascular,
        risk_score_respiratory: riskScores.respiratory,
        risk_score_stress: riskScores.stress,
        risk_score_overall: riskScores.overall,
        analysis_type: biometricData.analysisType || 'standard',
        device_info: biometricData.deviceInfo || {},
        quality_score: biometricData.qualityScore || 0,
        created_at: new Date().toISOString(),
        expires_at: calculateExpirationDate()
      })
      .select();

    if (error) throw error;

    // Log audit event
    await logAuditEvent({
      user_id: userId,
      action: 'CREATE_BIOMETRIC_DATA',
      resource_type: 'biometric_data',
      resource_id: data[0]?.id,
      details: {
        analysis_type: biometricData.analysisType,
        quality_score: biometricData.qualityScore
      },
      success: true
    });

    return data[0];
  } catch (error) {
    console.error('Save biometric data error:', error);
    
    // Log failed attempt
    await logAuditEvent({
      user_id: userId,
      action: 'CREATE_BIOMETRIC_DATA_FAILED',
      resource_type: 'biometric_data',
      details: { error: error.message },
      success: false
    });
    
    throw error;
  }
};

// Retrieve biometric data with decryption
export const getBiometricData = async (userId, options = {}) => {
  try {
    // Validate user permissions
    const hasPermission = await checkPermission(userId, PERMISSION_LEVELS.READ_OWN, 'biometric_data');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to read biometric data');
    }

    let query = supabase
      .from('biometric_data')
      .select('*')
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

    if (options.analysisType) {
      query = query.eq('analysis_type', options.analysisType);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Decrypt PHI data for each record
    const decryptedData = data.map(record => {
      try {
        const decryptedBiometrics = decryptPHI(record.encrypted_biometric_data);
        return {
          ...record,
          biometric_data: decryptedBiometrics,
          encrypted_biometric_data: undefined // Remove encrypted data from response
        };
      } catch (decryptError) {
        console.error('Decryption error for record:', record.id, decryptError);
        return {
          ...record,
          biometric_data: null,
          decryption_error: true
        };
      }
    });

    // Log audit event
    await logAuditEvent({
      user_id: userId,
      action: 'READ_BIOMETRIC_DATA',
      resource_type: 'biometric_data',
      details: {
        records_count: data.length,
        filters: options
      },
      success: true
    });

    return decryptedData;
  } catch (error) {
    console.error('Get biometric data error:', error);
    
    await logAuditEvent({
      user_id: userId,
      action: 'READ_BIOMETRIC_DATA_FAILED',
      resource_type: 'biometric_data',
      details: { error: error.message },
      success: false
    });
    
    throw error;
  }
};

// Get aggregated biometric data for companies (anonymized)
export const getAggregatedBiometricData = async (userId, organizationId, options = {}) => {
  try {
    // Validate company-level permissions
    const hasPermission = await checkPermission(userId, PERMISSION_LEVELS.READ_AGGREGATED, 'biometric_data');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to read aggregated biometric data');
    }

    // Get aggregated risk scores (no PHI)
    const { data, error } = await supabase
      .rpc('get_aggregated_biometric_stats', {
        org_id: organizationId,
        start_date: options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: options.endDate || new Date().toISOString()
      });

    if (error) throw error;

    // Log audit event
    await logAuditEvent({
      user_id: userId,
      action: 'READ_AGGREGATED_BIOMETRIC_DATA',
      resource_type: 'biometric_data',
      details: {
        organization_id: organizationId,
        date_range: {
          start: options.startDate,
          end: options.endDate
        }
      },
      success: true
    });

    return data;
  } catch (error) {
    console.error('Get aggregated biometric data error:', error);
    throw error;
  }
};

// Get anonymized population data for insurance analysis
export const getPopulationBiometricData = async (userId, filters = {}) => {
  try {
    // Validate insurance-level permissions
    const hasPermission = await checkPermission(userId, PERMISSION_LEVELS.READ_ANONYMIZED, 'biometric_data');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to read population biometric data');
    }

    // Get anonymized population statistics
    const { data, error } = await supabase
      .rpc('get_population_biometric_stats', {
        age_range: filters.ageRange,
        gender: filters.gender,
        industry: filters.industry,
        region: filters.region,
        start_date: filters.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: filters.endDate || new Date().toISOString()
      });

    if (error) throw error;

    // Log audit event
    await logAuditEvent({
      user_id: userId,
      action: 'READ_POPULATION_BIOMETRIC_DATA',
      resource_type: 'biometric_data',
      details: {
        filters: filters
      },
      success: true
    });

    return data;
  } catch (error) {
    console.error('Get population biometric data error:', error);
    throw error;
  }
};

// Delete biometric data (with retention policy compliance)
export const deleteBiometricData = async (userId, recordId) => {
  try {
    // Validate permissions
    const hasPermission = await checkPermission(userId, PERMISSION_LEVELS.WRITE_OWN, 'biometric_data');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to delete biometric data');
    }

    // Soft delete to maintain audit trail
    const { data, error } = await supabase
      .from('biometric_data')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId
      })
      .eq('id', recordId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    // Log audit event
    await logAuditEvent({
      user_id: userId,
      action: 'DELETE_BIOMETRIC_DATA',
      resource_type: 'biometric_data',
      resource_id: recordId,
      success: true
    });

    return data[0];
  } catch (error) {
    console.error('Delete biometric data error:', error);
    throw error;
  }
};

// Helper functions
const calculateRiskScores = (biometricData) => {
  // Calculate non-PHI risk scores for aggregation
  const cardiovascular = calculateCardiovascularRisk(biometricData);
  const respiratory = calculateRespiratoryRisk(biometricData);
  const stress = calculateStressRisk(biometricData);
  
  const overall = (cardiovascular + respiratory + stress) / 3;

  return {
    cardiovascular: Math.round(cardiovascular * 100) / 100,
    respiratory: Math.round(respiratory * 100) / 100,
    stress: Math.round(stress * 100) / 100,
    overall: Math.round(overall * 100) / 100
  };
};

const calculateCardiovascularRisk = (data) => {
  let risk = 0;
  
  if (data.heartRate) {
    if (data.heartRate > 100 || data.heartRate < 60) risk += 0.3;
  }
  
  if (data.bloodPressureSystolic && data.bloodPressureDiastolic) {
    if (data.bloodPressureSystolic > 140 || data.bloodPressureDiastolic > 90) risk += 0.4;
  }
  
  if (data.heartRateVariability) {
    if (data.heartRateVariability < 20) risk += 0.3;
  }
  
  return Math.min(risk, 1.0);
};

const calculateRespiratoryRisk = (data) => {
  let risk = 0;
  
  if (data.respiratoryRate) {
    if (data.respiratoryRate > 20 || data.respiratoryRate < 12) risk += 0.4;
  }
  
  if (data.oxygenSaturation) {
    if (data.oxygenSaturation < 95) risk += 0.6;
  }
  
  return Math.min(risk, 1.0);
};

const calculateStressRisk = (data) => {
  let risk = 0;
  
  if (data.stressLevel) {
    risk += data.stressLevel * 0.5;
  }
  
  if (data.fatigueLevel) {
    risk += data.fatigueLevel * 0.3;
  }
  
  if (data.emotionalState) {
    if (data.emotionalState.anxiety > 0.7) risk += 0.2;
  }
  
  return Math.min(risk, 1.0);
};

const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const calculateExpirationDate = () => {
  // HIPAA retention policy: 7 years from creation
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 7);
  return expirationDate.toISOString();
};

export default {
  saveBiometricData,
  getBiometricData,
  getAggregatedBiometricData,
  getPopulationBiometricData,
  deleteBiometricData
};