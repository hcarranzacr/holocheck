// Consent management service for biometric data
class ConsentService {
  constructor() {
    this.consentTypes = {
      BIOMETRIC_ANALYSIS: 'biometric_analysis',
      DATA_PROCESSING: 'data_processing',
      HEALTH_SCREENING: 'health_screening',
      AI_ANALYSIS: 'ai_analysis'
    };

    this.requiredConsents = [
      this.consentTypes.BIOMETRIC_ANALYSIS,
      this.consentTypes.DATA_PROCESSING,
      this.consentTypes.HEALTH_SCREENING,
      this.consentTypes.AI_ANALYSIS
    ];
  }

  getConsentTexts() {
    return {
      [this.consentTypes.BIOMETRIC_ANALYSIS]: {
        title: 'Análisis de Datos Biométricos',
        content: `
          Autorizo el análisis de mis datos biométricos (imagen facial y voz) para fines de screening de salud.
          
          Entiendo que:
          • Este análisis utiliza inteligencia artificial para detectar indicadores de salud
          • Los resultados son solo para screening, NO constituyen un diagnóstico médico
          • Los datos biométricos son sensibles y están protegidos por ley
          • Puedo retirar este consentimiento en cualquier momento
        `,
        required: true,
        category: 'biometric'
      },
      [this.consentTypes.DATA_PROCESSING]: {
        title: 'Procesamiento de Datos Personales',
        content: `
          Autorizo el procesamiento de mis datos personales de salud conforme a:
          
          • Ley de Protección de Datos de Costa Rica (Ley 8968)
          • Reglamento General de Protección de Datos (GDPR)
          • Ley de Protección de Datos de Panamá (Ley 81)
          
          Mis datos serán:
          • Procesados únicamente para análisis de salud
          • Almacenados de forma segura y encriptada
          • No compartidos con terceros sin mi consentimiento
          • Eliminados cuando solicite la eliminación de mi cuenta
        `,
        required: true,
        category: 'privacy'
      },
      [this.consentTypes.HEALTH_SCREENING]: {
        title: 'Screening de Salud No Diagnóstico',
        content: `
          Entiendo y acepto que:
          
          • Este sistema realiza SCREENING de salud, NO diagnósticos médicos
          • Los resultados son indicativos y requieren validación médica profesional
          • NO debo tomar decisiones médicas basadas únicamente en estos resultados
          • Debo consultar a un profesional de la salud para evaluación completa
          • En caso de emergencia médica, debo buscar atención inmediata
          
          Este sistema NO reemplaza la consulta médica profesional.
        `,
        required: true,
        category: 'medical'
      },
      [this.consentTypes.AI_ANALYSIS]: {
        title: 'Análisis con Inteligencia Artificial',
        content: `
          Autorizo el uso de inteligencia artificial para analizar mis datos biométricos.
          
          Entiendo que:
          • El análisis es realizado por algoritmos de IA (OpenAI GPT-4)
          • Los algoritmos pueden tener limitaciones y margen de error
          • Los resultados deben ser interpretados por profesionales de la salud
          • La precisión puede variar según la calidad de los datos capturados
          • La IA no puede detectar todas las condiciones médicas posibles
          
          Acepto las limitaciones inherentes del análisis automatizado.
        `,
        required: true,
        category: 'technology'
      }
    };
  }

  validateConsents(consents) {
    const validation = {
      isValid: true,
      missingConsents: [],
      errors: []
    };

    for (const requiredConsent of this.requiredConsents) {
      if (!consents[requiredConsent]) {
        validation.isValid = false;
        validation.missingConsents.push(requiredConsent);
      }
    }

    if (!validation.isValid) {
      validation.errors.push('Debe aceptar todos los consentimientos requeridos para continuar');
    }

    return validation;
  }

  recordConsent(userId, consents, ipAddress, userAgent) {
    const consentRecord = {
      userId,
      consents,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
      version: '1.0'
    };

    // In a real implementation, this would be stored in a database
    localStorage.setItem(`consent_${userId}`, JSON.stringify(consentRecord));
    
    return consentRecord;
  }

  getConsentRecord(userId) {
    const stored = localStorage.getItem(`consent_${userId}`);
    return stored ? JSON.parse(stored) : null;
  }

  revokeConsent(userId, consentType) {
    const record = this.getConsentRecord(userId);
    if (record && record.consents[consentType]) {
      record.consents[consentType] = false;
      record.revokedAt = new Date().toISOString();
      localStorage.setItem(`consent_${userId}`, JSON.stringify(record));
    }
  }

  hasValidConsent(userId) {
    const record = this.getConsentRecord(userId);
    if (!record) return false;

    // Check if all required consents are present and true
    for (const requiredConsent of this.requiredConsents) {
      if (!record.consents[requiredConsent]) {
        return false;
      }
    }

    // Check if consent is not too old (optional - implement if needed)
    const consentAge = Date.now() - new Date(record.timestamp).getTime();
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
    
    return consentAge < maxAge;
  }

  generateConsentSummary(consents) {
    const consentTexts = this.getConsentTexts();
    const summary = {
      totalConsents: Object.keys(consents).length,
      acceptedConsents: Object.values(consents).filter(Boolean).length,
      categories: {},
      details: []
    };

    for (const [consentType, accepted] of Object.entries(consents)) {
      const consentInfo = consentTexts[consentType];
      if (consentInfo) {
        if (!summary.categories[consentInfo.category]) {
          summary.categories[consentInfo.category] = { accepted: 0, total: 0 };
        }
        summary.categories[consentInfo.category].total++;
        if (accepted) {
          summary.categories[consentInfo.category].accepted++;
        }

        summary.details.push({
          type: consentType,
          title: consentInfo.title,
          accepted,
          required: consentInfo.required,
          category: consentInfo.category
        });
      }
    }

    return summary;
  }

  getPrivacyNotice() {
    return {
      title: 'Aviso de Privacidad - HoloCheck Digital Ensurace & Health Check',
      content: `
        RESPONSABLE DEL TRATAMIENTO:
        HoloCheck Digital Ensurace & Health Check
        
        FINALIDAD DEL TRATAMIENTO:
        • Realizar análisis de screening de salud mediante datos biométricos
        • Proporcionar recomendaciones de bienestar personalizadas
        • Generar reportes agregados y anónimos para empresas
        • Mejorar nuestros algoritmos de análisis de salud
        
        BASE LEGAL:
        • Consentimiento explícito del titular de los datos
        • Interés legítimo para mejora de servicios de salud
        
        DATOS TRATADOS:
        • Imágenes faciales (selfies)
        • Grabaciones de voz
        • Datos de salud derivados del análisis
        • Datos de contacto y perfil del usuario
        
        DERECHOS DEL TITULAR:
        • Acceso a sus datos personales
        • Rectificación de datos inexactos
        • Supresión de datos (derecho al olvido)
        • Portabilidad de datos
        • Oposición al tratamiento
        • Limitación del tratamiento
        
        CONSERVACIÓN:
        Los datos se conservarán mientras mantenga su cuenta activa y hasta 5 años después
        de su eliminación para cumplir con obligaciones legales.
        
        TRANSFERENCIAS:
        Los datos pueden ser transferidos a OpenAI (Estados Unidos) para análisis de IA,
        bajo las salvaguardas apropiadas de protección de datos.
        
        CONTACTO:
        Para ejercer sus derechos o consultas sobre privacidad:
        Email: privacidad@holoccheck.com
        Teléfono: +506 1234-5678
      `,
      lastUpdated: '2024-09-07',
      version: '1.0'
    };
  }
}

export default new ConsentService();