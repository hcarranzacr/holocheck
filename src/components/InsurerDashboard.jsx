import React, { useState, useEffect } from 'react';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Heart,
  Brain,
  Target,
  Clock,
  Download,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Building,
  Calculator,
  FileText,
  Zap,
  Eye,
  Globe,
  TrendingUp as Growth
} from 'lucide-react';

// Import data service
import dataStorageService from '../services/dataStorageService';
import timestampService from '../services/timestampService';

const InsurerDashboard = ({ onBack }) => {
  const [insurerData, setInsurerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('quarter');
  const [expandedSections, setExpandedSections] = useState({
    population: true,
    risk: true,
    claims: false,
    actuarial: false,
    companies: false
  });

  useEffect(() => {
    loadInsurerData();
  }, [selectedTimeframe]);

  const loadInsurerData = async () => {
    setLoading(true);
    try {
      const data = await dataStorageService.getInsurerMetrics();
      
      if (!data) {
        setInsurerData(generateDemoInsurerData());
      } else {
        setInsurerData(enhanceInsurerData(data));
      }
    } catch (error) {
      console.error('Error loading insurer data:', error);
      setInsurerData(generateDemoInsurerData());
    }
    setLoading(false);
  };

  const generateDemoInsurerData = () => {
    const companies = ['TechCorp', 'HealthPlus', 'ManufacturingInc', 'ServicesPro', 'RetailChain'];
    const companiesData = {};
    
    companies.forEach((company, index) => {
      const employees = Math.floor(Math.random() * 500) + 100;
      const analyses = Math.floor(employees * (Math.random() * 0.7 + 0.3));
      
      companiesData[`company_${index + 1}`] = {
        name: company,
        totalEmployees: employees,
        totalAnalyses: analyses,
        riskProfile: {
          low: Math.floor(analyses * (Math.random() * 0.4 + 0.3)),
          medium: Math.floor(analyses * (Math.random() * 0.4 + 0.3)),
          high: Math.floor(analyses * (Math.random() * 0.3 + 0.1))
        },
        claimsHistory: {
          lastYear: Math.floor(employees * (Math.random() * 0.15 + 0.05)),
          currentYear: Math.floor(employees * (Math.random() * 0.12 + 0.03)),
          averageClaimCost: Math.floor(Math.random() * 5000) + 2000
        },
        premiumData: {
          currentPremium: Math.floor(employees * (Math.random() * 200 + 150)),
          recommendedAdjustment: (Math.random() * 20 - 10).toFixed(1)
        }
      };
    });

    const totalEmployees = Object.values(companiesData).reduce((sum, company) => sum + company.totalEmployees, 0);
    const totalAnalyses = Object.values(companiesData).reduce((sum, company) => sum + company.totalAnalyses, 0);

    return {
      initialized: timestampService.generateTimestamp(),
      lastUpdated: timestampService.generateTimestamp(),
      totalPopulation: totalEmployees,
      totalAnalyses,
      companies: companiesData,
      
      populationHealth: {
        overallHealthScore: 73.2,
        healthTrend: 'improving',
        participationRate: 68.5,
        riskDistribution: {
          veryLow: Math.floor(totalAnalyses * 0.25),
          low: Math.floor(totalAnalyses * 0.35),
          medium: Math.floor(totalAnalyses * 0.25),
          high: Math.floor(totalAnalyses * 0.12),
          veryHigh: Math.floor(totalAnalyses * 0.03)
        }
      },

      riskSegmentation: {
        ageGroups: {
          '18-25': { population: Math.floor(totalEmployees * 0.15), avgRisk: 25.3, claimRate: 0.08 },
          '26-35': { population: Math.floor(totalEmployees * 0.35), avgRisk: 32.1, claimRate: 0.12 },
          '36-45': { population: Math.floor(totalEmployees * 0.30), avgRisk: 45.7, claimRate: 0.18 },
          '46-55': { population: Math.floor(totalEmployees * 0.15), avgRisk: 58.2, claimRate: 0.25 },
          '56+': { population: Math.floor(totalEmployees * 0.05), avgRisk: 67.8, claimRate: 0.35 }
        },
        industries: {
          'Tecnología': { companies: 12, avgRisk: 35.2, claimRate: 0.14, premium: 185 },
          'Manufactura': { companies: 8, avgRisk: 52.1, claimRate: 0.22, premium: 220 },
          'Servicios': { companies: 15, avgRisk: 41.7, claimRate: 0.16, premium: 195 },
          'Retail': { companies: 6, avgRisk: 38.9, claimRate: 0.15, premium: 175 },
          'Salud': { companies: 4, avgRisk: 29.8, claimRate: 0.11, premium: 165 }
        }
      },

      claimsPrediction: {
        predictedClaims: {
          nextMonth: 245,
          nextQuarter: 720,
          nextYear: 2880
        },
        claimsCostPrediction: {
          nextMonth: 1250000,
          nextQuarter: 3600000,
          nextYear: 14400000
        },
        riskFactors: [
          { factor: 'Estrés Laboral Alto', impact: 'high', prevalence: 23.5, costMultiplier: 1.8 },
          { factor: 'Problemas Cardiovasculares', impact: 'high', prevalence: 15.2, costMultiplier: 2.3 },
          { factor: 'Trastornos del Sueño', impact: 'medium', prevalence: 31.7, costMultiplier: 1.4 },
          { factor: 'Ansiedad/Depresión', impact: 'high', prevalence: 18.9, costMultiplier: 1.9 },
          { factor: 'Fatiga Crónica', impact: 'medium', prevalence: 28.3, costMultiplier: 1.3 }
        ]
      },

      actuarialAnalysis: {
        lossRatio: 0.78,
        expenseRatio: 0.15,
        combinedRatio: 0.93,
        profitMargin: 7.2,
        reserveAdequacy: 1.15,
        solvencyRatio: 2.34,
        
        premiumRecommendations: {
          overall: '+3.5%',
          byRiskSegment: {
            veryLow: '-2.0%',
            low: '0.0%',
            medium: '+2.5%',
            high: '+8.0%',
            veryHigh: '+15.0%'
          }
        },

        riskModeling: {
          catastrophicRisk: 0.02,
          pandemicImpact: 1.25,
          economicSensitivity: 0.85,
          seasonalVariation: 0.12
        }
      },

      biomarkerPopulationStats: {
        stressLevels: {
          population: totalAnalyses,
          average: 34.7,
          distribution: { low: 0.35, medium: 0.45, high: 0.20 },
          trend: 'stable',
          claimsCorrelation: 0.73
        },
        cardiovascularRisk: {
          population: totalAnalyses,
          average: 28.3,
          distribution: { low: 0.60, medium: 0.30, high: 0.10 },
          trend: 'improving',
          claimsCorrelation: 0.81
        },
        mentalHealthIndex: {
          population: totalAnalyses,
          average: 72.1,
          distribution: { low: 0.15, medium: 0.25, high: 0.60 },
          trend: 'declining',
          claimsCorrelation: 0.68
        },
        sleepQuality: {
          population: totalAnalyses,
          average: 69.8,
          distribution: { low: 0.25, medium: 0.45, high: 0.30 },
          trend: 'stable',
          claimsCorrelation: 0.52
        }
      },

      compliance: {
        dataPrivacy: 'GDPR Compliant',
        actuarialStandards: 'SOX Compliant',
        healthRegulations: 'HIPAA Compliant',
        lastAudit: timestampService.generateTimestamp(),
        complianceScore: 96.5
      }
    };
  };

  const enhanceInsurerData = (data) => {
    return {
      ...data,
    };
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando métricas poblacionales...</p>
        </div>
      </div>
    );
  }

  if (!insurerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron datos de aseguradora</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Dashboard Asegurador</h1>
            <button
              onClick={loadInsurerData}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-medium text-gray-900">Población Asegurada</h2>
              <p className="text-sm text-gray-600">{insurerData.totalPopulation.toLocaleString()} personas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'overview', label: 'General' },
              { key: 'segmentation', label: 'Segmentación' },
              { key: 'claims', label: 'Siniestros' },
              { key: 'actuarial', label: 'Actuarial' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6 max-w-4xl mx-auto">

        {/* Population Health Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('population')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Salud Poblacional</h3>
            </div>
            {expandedSections.population ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.population && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Puntuación de Salud</span>
                  </div>
                  <div className="text-3xl font-bold text-green-900">{insurerData.populationHealth.overallHealthScore}</div>
                  <div className="flex items-center space-x-1 text-sm text-green-700">
                    <TrendingUp className="w-4 h-4" />
                    <span>Mejorando</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Participación</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-900">{insurerData.populationHealth.participationRate}%</div>
                  <div className="text-sm text-blue-700">
                    {Math.round(insurerData.totalPopulation * insurerData.populationHealth.participationRate / 100).toLocaleString()} activos
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Distribución de Riesgo Poblacional</h4>
                {Object.entries(insurerData.populationHealth.riskDistribution).map(([risk, count]) => {
                  const percentage = (count / insurerData.totalAnalyses * 100).toFixed(1);
                  const colors = {
                    veryLow: 'bg-green-500',
                    low: 'bg-green-400',
                    medium: 'bg-yellow-500',
                    high: 'bg-orange-500',
                    veryHigh: 'bg-red-500'
                  };
                  
                  const labels = {
                    veryLow: 'Muy Bajo (0-20%)',
                    low: 'Bajo (21-40%)',
                    medium: 'Medio (41-60%)',
                    high: 'Alto (61-80%)',
                    veryHigh: 'Muy Alto (81-100%)'
                  };

                  return (
                    <div key={risk} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${colors[risk]}`}></div>
                        <span className="text-sm text-gray-700">{labels[risk]}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{percentage}%</div>
                        <div className="text-xs text-gray-600">{count.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Claims Prediction */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('claims')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="font-medium text-gray-900">Predicción de Siniestros</h3>
            </div>
            {expandedSections.claims ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.claims && (
            <div className="px-4 pb-4 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{insurerData.claimsPrediction.predictedClaims.nextMonth}</div>
                  <div className="text-sm text-gray-600">Próximo Mes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{insurerData.claimsPrediction.predictedClaims.nextQuarter}</div>
                  <div className="text-sm text-gray-600">Próximo Trimestre</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{insurerData.claimsPrediction.predictedClaims.nextYear.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Próximo Año</div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-3">Predicción de Costos</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700">Próximo Mes:</span>
                    <span className="font-medium text-red-900">${(insurerData.claimsPrediction.claimsCostPrediction.nextMonth / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700">Próximo Trimestre:</span>
                    <span className="font-medium text-red-900">${(insurerData.claimsPrediction.claimsCostPrediction.nextQuarter / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700">Próximo Año:</span>
                    <span className="font-medium text-red-900">${(insurerData.claimsPrediction.claimsCostPrediction.nextYear / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actuarial Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('actuarial')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-3">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h3 className="font-medium text-gray-900">Análisis Actuarial</h3>
            </div>
            {expandedSections.actuarial ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.actuarial && (
            <div className="px-4 pb-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-indigo-800">Ratio Combinado</div>
                  <div className="text-2xl font-bold text-indigo-900">{(insurerData.actuarialAnalysis.combinedRatio * 100).toFixed(1)}%</div>
                  <div className="text-xs text-indigo-700">
                    {insurerData.actuarialAnalysis.combinedRatio < 1 ? 'Rentable' : 'Pérdida'}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-800">Margen de Utilidad</div>
                  <div className="text-2xl font-bold text-green-900">{insurerData.actuarialAnalysis.profitMargin}%</div>
                  <div className="text-xs text-green-700">Objetivo: 5-10%</div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-3">Recomendaciones de Prima</h4>
                <div className="text-center mb-2">
                  <span className="text-lg font-bold text-yellow-900">Ajuste General: {insurerData.actuarialAnalysis.premiumRecommendations.overall}</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(insurerData.actuarialAnalysis.premiumRecommendations.byRiskSegment).map(([segment, adjustment]) => (
                    <div key={segment} className="flex justify-between text-sm">
                      <span className="text-yellow-700 capitalize">{segment}:</span>
                      <span className="font-medium text-yellow-900">{adjustment}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Exportar Reporte Actuarial</span>
          </button>

          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Calcular Primas</span>
          </button>
        </div>

        {/* Compliance Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Cumplimiento Regulatorio</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Privacidad de Datos:</span>
              <span className="text-sm font-medium text-green-600">{insurerData.compliance.dataPrivacy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Estándares Actuariales:</span>
              <span className="text-sm font-medium text-green-600">{insurerData.compliance.actuarialStandards}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Regulaciones de Salud:</span>
              <span className="text-sm font-medium text-green-600">{insurerData.compliance.healthRegulations}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Puntuación de Cumplimiento:</span>
              <span className="text-sm font-bold text-green-600">{insurerData.compliance.complianceScore}%</span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Última actualización: {timestampService.getRelativeTime(insurerData.lastUpdated)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsurerDashboard;