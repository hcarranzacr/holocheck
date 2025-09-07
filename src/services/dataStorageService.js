// Browser-compatible data storage service
// Using localStorage and IndexedDB for persistent storage

class DataStorageService {
  constructor() {
    this.dbName = 'HoloCheckDB';
    this.version = 1;
    this.db = null;
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('patients')) {
          const patientsStore = db.createObjectStore('patients', { keyPath: 'id' });
          patientsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('companies')) {
          db.createObjectStore('companies', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('insurers')) {
          db.createObjectStore('insurers', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' });
          analyticsStore.createIndex('type', 'type', { unique: false });
          analyticsStore.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  // Save patient biometric data
  async savePatientData(patientId, biometricData, timestamp) {
    try {
      await this.initDB();
      
      const patientData = {
        id: `${patientId}_${timestamp}`,
        patientId,
        timestamp,
        biometricData,
        createdAt: new Date().toISOString()
      };

      const transaction = this.db.transaction(['patients'], 'readwrite');
      const store = transaction.objectStore('patients');
      await store.add(patientData);

      // Also save to localStorage as backup
      const storageKey = `holoccheck_patient_${patientId}_${timestamp}`;
      localStorage.setItem(storageKey, JSON.stringify(patientData));

      return patientData;
    } catch (error) {
      console.error('Error saving patient data:', error);
      // Fallback to localStorage only
      const patientData = {
        id: `${patientId}_${timestamp}`,
        patientId,
        timestamp,
        biometricData,
        createdAt: new Date().toISOString()
      };
      const storageKey = `holoccheck_patient_${patientId}_${timestamp}`;
      localStorage.setItem(storageKey, JSON.stringify(patientData));
      return patientData;
    }
  }

  // Get patient history
  async getPatientHistory(patientId) {
    try {
      await this.initDB();
      
      const transaction = this.db.transaction(['patients'], 'readonly');
      const store = transaction.objectStore('patients');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const allData = request.result;
          const patientData = allData.filter(data => data.patientId === patientId);
          resolve(patientData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting patient history:', error);
      // Fallback to localStorage
      const history = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`holoccheck_patient_${patientId}_`)) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            history.push(data);
          } catch (e) {
            console.error('Error parsing localStorage data:', e);
          }
        }
      }
      return history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  // Save company statistics
  async saveCompanyStats(companyId, stats) {
    try {
      await this.initDB();
      
      const companyData = {
        id: companyId,
        stats,
        lastUpdated: new Date().toISOString()
      };

      const transaction = this.db.transaction(['companies'], 'readwrite');
      const store = transaction.objectStore('companies');
      await store.put(companyData);

      // Also save to localStorage
      localStorage.setItem(`holoccheck_company_${companyId}`, JSON.stringify(companyData));

      return companyData;
    } catch (error) {
      console.error('Error saving company stats:', error);
      const companyData = {
        id: companyId,
        stats,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`holoccheck_company_${companyId}`, JSON.stringify(companyData));
      return companyData;
    }
  }

  // Get company statistics
  async getCompanyStats(companyId) {
    try {
      await this.initDB();
      
      const transaction = this.db.transaction(['companies'], 'readonly');
      const store = transaction.objectStore('companies');
      const request = store.get(companyId);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result);
          } else {
            // Try localStorage fallback
            const stored = localStorage.getItem(`holoccheck_company_${companyId}`);
            resolve(stored ? JSON.parse(stored) : null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting company stats:', error);
      const stored = localStorage.getItem(`holoccheck_company_${companyId}`);
      return stored ? JSON.parse(stored) : null;
    }
  }

  // Save insurer analytics
  async saveInsurerAnalytics(insurerId, analytics) {
    try {
      await this.initDB();
      
      const insurerData = {
        id: insurerId,
        analytics,
        lastUpdated: new Date().toISOString()
      };

      const transaction = this.db.transaction(['insurers'], 'readwrite');
      const store = transaction.objectStore('insurers');
      await store.put(insurerData);

      localStorage.setItem(`holoccheck_insurer_${insurerId}`, JSON.stringify(insurerData));

      return insurerData;
    } catch (error) {
      console.error('Error saving insurer analytics:', error);
      const insurerData = {
        id: insurerId,
        analytics,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`holoccheck_insurer_${insurerId}`, JSON.stringify(insurerData));
      return insurerData;
    }
  }

  // Get all patient data for analytics
  async getAllPatientsData() {
    try {
      await this.initDB();
      
      const transaction = this.db.transaction(['patients'], 'readonly');
      const store = transaction.objectStore('patients');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting all patients data:', error);
      // Fallback to localStorage
      const allData = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('holoccheck_patient_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            allData.push(data);
          } catch (e) {
            console.error('Error parsing localStorage data:', e);
          }
        }
      }
      return allData;
    }
  }

  // Generate aggregated statistics
  async generateAggregatedStats() {
    const allPatients = await this.getAllPatientsData();
    
    if (allPatients.length === 0) {
      return {
        totalPatients: 0,
        averageRiskScore: 0,
        riskDistribution: { low: 0, medium: 0, high: 0 },
        trends: []
      };
    }

    const riskDistribution = { low: 0, medium: 0, high: 0 };
    let totalRiskScore = 0;

    allPatients.forEach(patient => {
      const riskLevel = patient.biometricData?.riskLevel?.toLowerCase() || 'medium';
      riskDistribution[riskLevel] = (riskDistribution[riskLevel] || 0) + 1;
      
      // Calculate risk score (0-100)
      const riskScore = riskLevel === 'low' ? 25 : riskLevel === 'medium' ? 50 : 75;
      totalRiskScore += riskScore;
    });

    const averageRiskScore = totalRiskScore / allPatients.length;

    return {
      totalPatients: allPatients.length,
      averageRiskScore: Math.round(averageRiskScore),
      riskDistribution,
      lastUpdated: new Date().toISOString(),
      trends: this.calculateTrends(allPatients)
    };
  }

  calculateTrends(patientsData) {
    // Group by date and calculate daily averages
    const dailyData = {};
    
    patientsData.forEach(patient => {
      const date = new Date(patient.createdAt).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = { count: 0, totalRisk: 0 };
      }
      
      const riskLevel = patient.biometricData?.riskLevel?.toLowerCase() || 'medium';
      const riskScore = riskLevel === 'low' ? 25 : riskLevel === 'medium' ? 50 : 75;
      
      dailyData[date].count++;
      dailyData[date].totalRisk += riskScore;
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        averageRisk: Math.round(data.totalRisk / data.count),
        patientCount: data.count
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 days
  }

  // Export data for backup
  async exportAllData() {
    const patients = await this.getAllPatientsData();
    const companies = [];
    const insurers = [];

    // Get company data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('holoccheck_company_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          companies.push(data);
        } catch (e) {
          console.error('Error parsing company data:', e);
        }
      }
    }

    // Get insurer data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('holoccheck_insurer_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          insurers.push(data);
        } catch (e) {
          console.error('Error parsing insurer data:', e);
        }
      }
    }

    return {
      patients,
      companies,
      insurers,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }
}

// Export singleton instance
export const dataStorageService = new DataStorageService();
export default dataStorageService;