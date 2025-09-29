import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'HoloCheck_Default_Key_2024';

/**
 * HIPAA-compliant encryption utilities for Protected Health Information (PHI)
 */

// Encrypt sensitive data (PHI) before storing in database
export const encryptPHI = (data) => {
  try {
    if (!data) return null;
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
    
    return {
      encrypted_data: encrypted,
      encryption_version: '1.0',
      encrypted_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt PHI data');
  }
};

// Decrypt PHI data when retrieving from database
export const decryptPHI = (encryptedData) => {
  try {
    if (!encryptedData || !encryptedData.encrypted_data) return null;
    
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData.encrypted_data, ENCRYPTION_KEY);
    const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('Invalid encryption key or corrupted data');
    }
    
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt PHI data');
  }
};

// Hash sensitive identifiers for indexing while maintaining privacy
export const hashIdentifier = (identifier) => {
  return CryptoJS.SHA256(identifier + ENCRYPTION_KEY).toString();
};

// Generate secure session tokens
export const generateSecureToken = () => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

// Validate data integrity
export const validateDataIntegrity = (data, hash) => {
  const computedHash = CryptoJS.SHA256(JSON.stringify(data) + ENCRYPTION_KEY).toString();
  return computedHash === hash;
};

export default {
  encryptPHI,
  decryptPHI,
  hashIdentifier,
  generateSecureToken,
  validateDataIntegrity
};