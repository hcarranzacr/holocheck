import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Camera, Mic, Activity, Heart, Brain, Zap, Shield, AlertTriangle, CheckCircle, 
  Clock, TrendingUp, TrendingDown, Minus, ArrowLeft, Download, History, Eye, Building
} from 'lucide-react';

import BiometricCapture from './BiometricCapture';
import VoiceCapture from './VoiceCapture';
import DetailedBiomarkers from './DetailedBiomarkers';
import CompanyDashboard from './CompanyDashboard';
import InsurerDashboard from './InsurerDashboard';

import openaiService from '../services/openaiService';
import timestampService from '../services/timestampService';
import storageService from '../services/storageService';
import dataStorageService from '../services/dataStorageService';

const EmployeeHealthCheck = ({ user, onBack }) => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedAudio, setCapturedAudio] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState('');
  const [userHistory, setUserHistory] = useState([]);
  const [userStats, setUserStats] = useState(null);

  // Memoize user properties to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id || user?.username || 'demo_user', [user?.id, user?.username]);
  const userRole = useMemo(() => user?.role || user?.accessType || 'employee', [user?.role, user?.accessType]);
  const companyId = useMemo(() => user?.companyId || 'demo_company', [user?.companyId]);

  // Memoize loadUserData function to prevent infinite loops
  const loadUserData = useCallback(async () => {
    try {
      const history = storageService.getUserAnalyses(userId, { limit: 10 });
      const stats = storageService.getUserStatistics(userId);
      setUserHistory(history);
      setUserStats(stats);

      try {
        const patientData = await dataStorageService.getPatientData(userId, companyId);
        if (patientData) {
          console.log('Loaded patient data from persistent storage:', patientData);
        }
      } catch (error) {
        console.log('No persistent data found, using local storage');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [userId, companyId]); // Only depend on stable values

  // Use effect with proper dependency array
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleBiometricCapture = useCallback((imageUrl) => {
    setCapturedImage(imageUrl);
    setCurrentStep('voice');
  }, []);

  const handleVoiceCapture = useCallback((audioBlob) => {
    setCapturedAudio(audioBlob);
    setCurrentStep('analysis');
    performAnalysis(capturedImage, audioBlob);
  }, [capturedImage]);

  const performAnalysis = useCallback(async (imageUrl, audioBlob) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError('');

    let progressInterval;

    try {
      progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();

      const result = await openaiService.analyzeBiometricData(imageBlob, audioBlob, {
        userId,
        timestamp: timestampService.generateTimestamp(),
        extractDetailedBiomarkers: true,
        includeVoiceAnalysis: true,
        includeFacialAnalysis: true,
        includeDerivedMetrics: true
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const timestamp = storageService.saveAnalysis(userId, result, {
        image: imageBlob,
        audio: audioBlob,
        audioDuration: 25
      });

      try {
        await dataStorageService.savePatientAnalysis(userId, companyId, result, {
          image: imageBlob,
          audio: audioBlob,
          audioDuration: 25
        });
        console.log('Analysis saved to persistent storage');
      } catch (error) {
        console.log('Could not save to persistent storage, using local only');
      }

      setAnalysisResult({
        ...result,
        timestamp,
        readableDate: timestampService.getReadableDate(timestamp)
      });

      // Reload user data after successful analysis
      await loadUserData();

      setTimeout(() => {
        setCurrentStep('results');
        setIsAnalyzing(false);
      }, 1000);

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Error al analizar los datos biométricos. Inténtalo de nuevo.');
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  }, [userId, companyId, loadUserData]);

  const startNewAnalysis = useCallback(() => {
    setCapturedImage(null);
    setCapturedAudio(null);
    setAnalysisResult(null);
    setError('');
    setAnalysisProgress(0);
    setCurrentStep('welcome');
  }, []);

  // Memoize utility functions
  const getRiskColor = useCallback((risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': case 'bajo': return 'text-green-600 bg-green-100';
      case 'medium': case 'medio': return 'text-yellow-600 bg-yellow-100';
      case 'high': case 'alto': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getRiskIcon = useCallback((risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': case 'bajo': return <CheckCircle className="w-5 h-5" />;
      case 'medium': case 'medio': return <AlertTriangle className="w-5 h-5" />;
      case 'high': case 'alto': return <Shield className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  }, []);

  const getTrendIcon = useCallback((trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  }, []);

  // Memoize navigation handlers
  const handleHistoryClick = useCallback(() => setCurrentStep('history'), []);
  const handleCompanyClick = useCallback(() => setCurrentStep('company'), []);
  const handleInsurerClick = useCallback(() => setCurrentStep('insurer'), []);
  const handleBiometricClick = useCallback(() => setCurrentStep('biometric'), []);
  const handleDetailedClick = useCallback(() => setCurrentStep('detailed'), []);
  const handleWelcomeClick = useCallback(() => setCurrentStep('welcome'), []);
  const handleResultsClick = useCallback(() => setCurrentStep('results'), []);

  // Memoize step navigation handlers
  const handleVoiceNext = useCallback(() => setCurrentStep('analysis'), []);
  const handleBiometricBack = useCallback(() => setCurrentStep('welcome'), []);
  const handleVoiceBack = useCallback(() => setCurrentStep('biometric'), []);

  // Memoize history item click handler
  const handleHistoryItemClick = useCallback((analysis) => {
    setAnalysisResult(analysis.analysisResult);
    setCurrentStep('detailed');
  }, []);

  // Main render logic with all integrated components
  return (
    <div className="w-full">
      {currentStep === 'welcome' && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">HoloCheck</h1>
            <button onClick={handleHistoryClick} className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <History className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-sm mx-auto space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Análisis Biométrico</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Evaluación completa de tu estado de salud mediante análisis de imagen y voz con IA
              </p>
            </div>

            {/* Role-based Quick Access */}
            {(userRole === 'company' || userRole === 'insurer') && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Acceso Rápido</h3>
                <div className="space-y-2">
                  {userRole === 'company' && (
                    <button
                      onClick={handleCompanyClick}
                      className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Building className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Dashboard Empresarial</span>
                    </button>
                  )}
                  {userRole === 'insurer' && (
                    <button
                      onClick={handleInsurerClick}
                      className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Dashboard Asegurador</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleBiometricClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-base shadow-lg"
            >
              <Activity className="w-5 h-5" />
              <span>Comenzar Análisis</span>
            </button>

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800 text-center">
                ⚠️ Este análisis es informativo y no reemplaza la consulta médica profesional
              </p>
            </div>
          </div>
        </div>
      )}
      
      {currentStep === 'biometric' && (
        <BiometricCapture
          onCapture={handleBiometricCapture}
          onNext={handleVoiceNext}
          onBack={handleBiometricBack}
        />
      )}
      
      {currentStep === 'voice' && (
        <VoiceCapture
          onCapture={handleVoiceCapture}
          onNext={handleVoiceNext}
          onBack={handleVoiceBack}
        />
      )}
      
      {currentStep === 'analysis' && (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
          <div className="max-w-sm mx-auto text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full bg-blue-600 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full bg-blue-500 animate-ping"></div>
                <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Analizando Datos Biométricos</h2>
              <p className="text-sm text-gray-600">
                Procesando más de 80 biomarcadores con inteligencia artificial
              </p>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {Math.round(analysisProgress)}% Completado
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={startNewAnalysis}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep === 'results' && analysisResult && (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-6">
            <button onClick={startNewAnalysis} className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Resultados</h1>
            <button onClick={() => {}} className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Download className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-sm mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${getRiskColor(analysisResult.riskLevel || 'medium')}`}>
                {getRiskIcon(analysisResult.riskLevel || 'medium')}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Riesgo {analysisResult.riskLevel === 'bajo' ? 'Bajo' : analysisResult.riskLevel === 'medio' ? 'Medio' : 'Alto'}
              </h2>
              <div className="text-3xl font-bold text-gray-900 mb-2">{Math.round((analysisResult.overallScore || 5) * 10)}%</div>
              <p className="text-sm text-gray-600">{analysisResult.readableDate}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDetailedClick}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>Ver Biomarcadores Detallados</span>
              </button>

              <button
                onClick={startNewAnalysis}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Activity className="w-5 h-5" />
                <span>Nuevo Análisis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'detailed' && (
        <DetailedBiomarkers
          analysisResult={analysisResult}
          onBack={handleResultsClick}
        />
      )}

      {currentStep === 'history' && (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleWelcomeClick} className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Historial</h1>
            <div className="w-10"></div>
          </div>

          <div className="max-w-sm mx-auto space-y-4">
            <div className="space-y-3">
              {userHistory.length > 0 ? (
                userHistory.map((analysis, index) => (
                  <div key={analysis.timestamp} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Análisis #{userHistory.length - index}
                      </span>
                      <span className="text-xs text-gray-600">
                        {timestampService.getRelativeTime(analysis.timestamp)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleHistoryItemClick(analysis)}
                      className="mt-2 w-full text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Ver detalles completos
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay análisis previos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'company' && (
        <CompanyDashboard
          companyId={companyId}
          onBack={handleWelcomeClick}
        />
      )}

      {currentStep === 'insurer' && (
        <InsurerDashboard
          onBack={handleWelcomeClick}
        />
      )}
    </div>
  );
};

export default EmployeeHealthCheck;