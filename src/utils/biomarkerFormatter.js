/**
 * Biomarker Formatter Utility
 * Formats biomarker values for display with appropriate decimal precision
 */

// Specific formatting rules for different biomarker types
const BIOMARKER_FORMATS = {
  // Cardiovascular metrics
  heartRate: { decimals: 1, unit: 'BPM' },
  heartRateVariability: { decimals: 1, unit: 'ms' },
  rmssd: { decimals: 1, unit: 'ms' },
  sdnn: { decimals: 1, unit: 'ms' },
  pnn50: { decimals: 1, unit: '%' },
  bloodPressure: { decimals: 0, unit: 'mmHg', format: 'systolic/diastolic' },
  oxygenSaturation: { decimals: 1, unit: '%' },
  
  // Voice biomarkers
  fundamentalFrequency: { decimals: 1, unit: 'Hz' },
  jitter: { decimals: 1, unit: '%' },
  shimmer: { decimals: 1, unit: '%' },
  harmonicToNoiseRatio: { decimals: 1, unit: 'dB' },
  vocalStress: { decimals: 1, unit: '%' },
  
  // HRV frequency domain
  lfPower: { decimals: 0, unit: 'ms²' },
  hfPower: { decimals: 0, unit: 'ms²' },
  lfHfRatio: { decimals: 2, unit: '' },
  
  // Default for unlisted biomarkers
  default: { decimals: 1, unit: '' }
};

/**
 * Format a biomarker value with appropriate precision and unit
 * @param {number|string} value - The biomarker value
 * @param {string} biomarkerType - Type of biomarker for specific formatting
 * @param {number} defaultDecimals - Default decimal places if type not found
 * @param {string} fallback - Fallback text for null/undefined values
 * @returns {string} Formatted biomarker string
 */
export function formatBiomarkerValue(value, biomarkerType = '', defaultDecimals = 1, fallback = 'No calculado') {
  // Handle null, undefined, or zero values
  if (value === null || value === undefined || value === 0 || value === '') {
    return fallback;
  }

  // Handle non-numeric values
  if (typeof value !== 'number') {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return fallback;
    }
    value = numValue;
  }

  // Get formatting rules for this biomarker type
  const format = BIOMARKER_FORMATS[biomarkerType] || BIOMARKER_FORMATS.default;
  const decimals = format.decimals !== undefined ? format.decimals : defaultDecimals;
  
  // Format the number
  const formattedNumber = value.toFixed(decimals);
  
  // Add unit if specified
  return format.unit ? `${formattedNumber} ${format.unit}` : formattedNumber;
}

/**
 * Format specific biomarker types with their standard units
 * @param {string} biomarkerType - The biomarker type
 * @param {number} value - The value to format
 * @param {string} fallback - Fallback text for invalid values
 * @returns {string} Formatted biomarker string
 */
export function formatSpecificBiomarker(biomarkerType, value, fallback = 'No calculado') {
  if (value === null || value === undefined || value === 0) {
    return fallback;
  }

  switch (biomarkerType) {
    case 'heartRate':
      return formatBiomarkerValue(value, 'heartRate', 1, fallback);
    
    case 'rmssd':
    case 'heartRateVariability':
      return formatBiomarkerValue(value, 'rmssd', 1, fallback);
    
    case 'oxygenSaturation':
      return formatBiomarkerValue(value, 'oxygenSaturation', 1, fallback);
    
    case 'bloodPressure':
      // Handle blood pressure as systolic/diastolic
      if (typeof value === 'string' && value.includes('/')) {
        return value; // Already formatted
      }
      return formatBiomarkerValue(value, 'bloodPressure', 0, fallback);
    
    case 'fundamentalFrequency':
      return formatBiomarkerValue(value, 'fundamentalFrequency', 1, fallback);
    
    case 'jitter':
      return formatBiomarkerValue(value, 'jitter', 1, fallback);
    
    case 'shimmer':
      return formatBiomarkerValue(value, 'shimmer', 1, fallback);
    
    case 'vocalStress':
      return formatBiomarkerValue(value, 'vocalStress', 1, fallback);
    
    default:
      return formatBiomarkerValue(value, biomarkerType, 1, fallback);
  }
}

/**
 * Format all biomarkers in a data object
 * @param {Object} biomarkerData - Object containing biomarker values
 * @returns {Object} Object with formatted biomarker values
 */
export function formatAllBiomarkers(biomarkerData) {
  const formatted = {};
  
  Object.keys(biomarkerData).forEach(key => {
    const value = biomarkerData[key];
    formatted[key] = formatSpecificBiomarker(key, value);
  });
  
  return formatted;
}

export default {
  formatBiomarkerValue,
  formatSpecificBiomarker,
  formatAllBiomarkers
};