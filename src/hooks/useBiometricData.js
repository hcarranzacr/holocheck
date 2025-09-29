import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  saveBiometricData, 
  getBiometricData, 
  getAggregatedBiometricData 
} from '../services/supabase/biometricDataService';

export const useBiometricData = () => {
  const { user, userProfile } = useAuth();
  const [biometricData, setBiometricData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save biometric data
  const saveBiometric = async (data) => {
    if (!user) {
      setError('Usuario no autenticado');
      return { success: false, error: 'Usuario no autenticado' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await saveBiometricData(user.id, data);
      
      // Refresh data after saving
      await fetchBiometricData();
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch biometric data
  const fetchBiometricData = async (options = {}) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getBiometricData(user.id, options);
      setBiometricData(data);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setBiometricData([]);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch aggregated data for companies
  const fetchAggregatedData = async (organizationId, options = {}) => {
    if (!user || !userProfile?.company_id) {
      setError('Acceso no autorizado');
      return { success: false, error: 'Acceso no autorizado' };
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getAggregatedBiometricData(user.id, organizationId, options);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get latest biometric reading
  const getLatestReading = () => {
    if (biometricData.length === 0) return null;
    return biometricData[0]; // Data is sorted by created_at DESC
  };

  // Get biometric trends
  const getTrends = (metric, days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentData = biometricData.filter(
      item => new Date(item.created_at) >= cutoffDate
    );

    if (recentData.length < 2) return null;

    const values = recentData
      .map(item => item.biometric_data?.[metric])
      .filter(val => val !== undefined)
      .reverse(); // Chronological order

    if (values.length < 2) return null;

    const latest = values[values.length - 1];
    const previous = values[values.length - 2];
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    return {
      current: latest,
      previous: previous,
      average: Math.round(average * 100) / 100,
      trend: latest > previous ? 'up' : latest < previous ? 'down' : 'stable',
      change: Math.round(((latest - previous) / previous) * 100 * 100) / 100,
      dataPoints: values.length
    };
  };

  // Calculate risk score
  const calculateRiskScore = () => {
    const latest = getLatestReading();
    if (!latest?.biometric_data) return null;

    const data = latest.biometric_data;
    let riskScore = 0;
    let factors = 0;

    // Heart rate risk
    if (data.heart_rate) {
      if (data.heart_rate > 100 || data.heart_rate < 60) riskScore += 0.3;
      factors++;
    }

    // Blood pressure risk
    if (data.blood_pressure_systolic && data.blood_pressure_diastolic) {
      if (data.blood_pressure_systolic > 140 || data.blood_pressure_diastolic > 90) {
        riskScore += 0.4;
      }
      factors++;
    }

    // Stress level risk
    if (data.stress_level) {
      riskScore += data.stress_level * 0.3;
      factors++;
    }

    if (factors === 0) return null;

    const normalizedScore = Math.min(riskScore / factors, 1.0);
    
    return {
      score: Math.round(normalizedScore * 100),
      level: normalizedScore < 0.3 ? 'low' : 
             normalizedScore < 0.6 ? 'moderate' : 
             normalizedScore < 0.8 ? 'high' : 'critical',
      factors: factors
    };
  };

  // Auto-fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchBiometricData({ limit: 50 });
    } else {
      setBiometricData([]);
    }
  }, [user]);

  return {
    // Data
    biometricData,
    loading,
    error,
    
    // Actions
    saveBiometric,
    fetchBiometricData,
    fetchAggregatedData,
    
    // Computed values
    getLatestReading,
    getTrends,
    calculateRiskScore,
    
    // Helpers
    hasData: biometricData.length > 0,
    dataCount: biometricData.length
  };
};

export default useBiometricData;