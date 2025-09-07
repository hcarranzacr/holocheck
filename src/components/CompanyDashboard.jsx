import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Building,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Heart,
  Brain,
  Shield,
  Clock,
  Download,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Target,
  Zap,
  Coffee,
  Moon
} from 'lucide-react';

// Import data service
import dataStorageService from '../services/dataStorageService';
import timestampService from '../services/timestampService';

const CompanyDashboard = ({ companyId = 'demo_company', onBack }) => {
  const [companyStats, setCompanyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, quarter, year
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    risks: true,
    trends: false,
    departments: false,
    biomarkers: false
  });

  // Load company data
  useEffect(() => {
    loadCompanyData();
  }, [companyId, selectedPeriod]);

  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const stats = await dataStorageService.getCompanyStatistics(companyId);
      
      // If no real data, generate demo data
      if (!stats) {
        setCompanyStats(generateDemoCompanyData());
      } else {
        setCompanyStats(stats);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      setCompanyStats(generateDemoCompanyData());
    }
    setLoading(false);
  };

  // Generate demo company data for demonstration
  const generateDemoCompanyData = () => {
    const departments = ['Administración', 'Ventas', 'IT', 'RRHH', 'Operaciones', 'Marketing'];
    const departmentStats = {};
    
    departments.forEach(dept => {
      const totalEmployees = Math.floor(Math.random() * 50) + 10;
      const analysesCount = Math.floor(totalEmployees * (Math.random() * 0.8 + 0.2));
      
      departmentStats[dept] = {
        totalEmployees,
        analysesCompleted: analysesCount,
        riskDistribution: {
          low: Math.floor(analysesCount * (Math.random() * 0.4 + 0.3)),
          medium: Math.floor(analysesCount * (Math.random() * 0.4 + 0.3)),
          high: Math.floor(analysesCount * (Math.random() * 0.3 + 0.1))
        },
        averageRiskScore: Math.floor(Math.random() * 40) + 30,
        productivityCorrelation: Math.random() * 0.4 + 0.6,
        absenteeismRate: Math.random() * 5 + 1,
        wellnessEngagement: Math.random() * 30 + 70
      };
    });

    return {
      companyId,
      companyName: 'Empresa Demo S.A.',
      created: timestampService.generateTimestamp(),
      lastUpdated: timestampService.generateTimestamp(),
      totalEmployees: Object.values(departmentStats).reduce((sum, dept) => sum + dept.totalEmployees, 0),
      totalAnalyses: Object.values(departmentStats).reduce((sum, dept) => sum + dept.analysesCompleted, 0),
      riskDistribution: {
        low: Object.values(departmentStats).reduce((sum, dept) => sum + dept.riskDistribution.low, 0),
        medium: Object.values(departmentStats).reduce((sum, dept) => sum + dept.riskDistribution.medium, 0),
        high: Object.values(departmentStats).reduce((sum, dept) => sum + dept.riskDistribution.high, 0)
      },
      departmentStats,
      trends: {
        daily: generateTrendData(30),
        weekly: generateTrendData(12),
        monthly: generateTrendData(6)
      },
      kpis: {
        participationRate: 85.2,
        averageRiskScore: 42.1,
        riskReduction: 12.5,
        productivityImpact: 8.3,
        roiWellnessProgram: 245,
        predictedAbsenteeism: 3.2
      },
      biomarkerAggregates: {
        stressLevels: { average: 32.1, trend: 'decreasing' },
        fatigueIndex: { average: 28.5, trend: 'stable' },
        sleepQuality: { average: 76.8, trend: 'increasing' },
        cardiovascularRisk: { average: 15.2, trend: 'decreasing' }
      }
    };
  };

  const generateTrendData = (periods) => {
    return Array.from({ length: periods }, (_, i) => ({
      period: i + 1,
      analyses: Math.floor(Math.random() * 50) + 20,
      riskScore: Math.floor(Math.random() * 30) + 35,
      participation: Math.floor(Math.random() * 20) + 75
    }));
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
          <p className="text-gray-600">Cargando datos de la empresa...</p>
        </div>
      </div>
    );
  }

  if (!companyStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron datos de la empresa</p>
        </div>
      </div>
    );
  }

  // Calculate percentages for risk distribution
  const totalRiskAnalyses = companyStats.riskDistribution.low + companyStats.riskDistribution.medium + companyStats.riskDistribution.high;
  const riskPercentages = {
    low: totalRiskAnalyses > 0 ? (companyStats.riskDistribution.low / totalRiskAnalyses * 100) : 0,
    medium: totalRiskAnalyses > 0 ? (companyStats.riskDistribution.medium / totalRiskAnalyses * 100) : 0,
    high: totalRiskAnalyses > 0 ? (companyStats.riskDistribution.high / totalRiskAnalyses * 100) : 0
  };

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
            <h1 className="text-lg font-bold text-gray-900">Dashboard Empresarial</h1>
            <button
              onClick={loadCompanyData}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>

          {/* Company Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-medium text-gray-900">{companyStats.companyName}</h2>
              <p className="text-sm text-gray-600">{companyStats.totalEmployees} empleados</p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'week', label: 'Semana' },
              { key: 'month', label: 'Mes' },
              { key: 'quarter', label: 'Trimestre' },
              { key: 'year', label: 'Año' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === key
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
        
        {/* KPI Overview Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('overview')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">KPIs Principales</h3>
            </div>
            {expandedSections.overview ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.overview && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Participación</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{companyStats.kpis.participationRate}%</div>
                  <div className="text-xs text-blue-700">de empleados activos</div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">ROI Bienestar</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">{companyStats.kpis.roiWellnessProgram}%</div>
                  <div className="text-xs text-green-700">retorno de inversión</div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Activity className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Riesgo Promedio</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">{companyStats.kpis.averageRiskScore}</div>
                  <div className="text-xs text-yellow-700">puntuación de riesgo</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Productividad</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">+{companyStats.kpis.productivityImpact}%</div>
                  <div className="text-xs text-purple-700">mejora estimada</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Risk Distribution Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('risks')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-gray-900">Distribución de Riesgo</h3>
            </div>
            {expandedSections.risks ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.risks && (
            <div className="px-4 pb-4">
              {/* Risk Overview */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{Math.round(riskPercentages.low)}%</div>
                  <div className="text-sm text-gray-600">Riesgo Bajo</div>
                  <div className="text-xs text-gray-500">{companyStats.riskDistribution.low} empleados</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{Math.round(riskPercentages.medium)}%</div>
                  <div className="text-sm text-gray-600">Riesgo Medio</div>
                  <div className="text-xs text-gray-500">{companyStats.riskDistribution.medium} empleados</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">{Math.round(riskPercentages.high)}%</div>
                  <div className="text-sm text-gray-600">Riesgo Alto</div>
                  <div className="text-xs text-gray-500">{companyStats.riskDistribution.high} empleados</div>
                </div>
              </div>

              {/* Risk Trend */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Tendencia de Riesgo</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">Reducción del {companyStats.kpis.riskReduction}% en el último mes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${companyStats.kpis.riskReduction * 2}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Department Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('departments')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-3">
              <Building className="w-5 h-5 text-indigo-600" />
              <h3 className="font-medium text-gray-900">Análisis por Departamento</h3>
            </div>
            {expandedSections.departments ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.departments && (
            <div className="px-4 pb-4 space-y-4">
              {Object.entries(companyStats.departmentStats).map(([deptName, deptData]) => (
                <div key={deptName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{deptName}</h4>
                    <span className="text-sm text-gray-600">{deptData.totalEmployees} empleados</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-600">Participación</div>
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round((deptData.analysesCompleted / deptData.totalEmployees) * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Riesgo Promedio</div>
                      <div className={`text-lg font-bold ${
                        deptData.averageRiskScore <= 30 ? 'text-green-600' :
                        deptData.averageRiskScore <= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {deptData.averageRiskScore}
                      </div>
                    </div>
                  </div>

                  {/* Department Risk Distribution */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Distribución de Riesgo</span>
                    </div>
                    <div className="flex space-x-1 h-2 rounded-full overflow-hidden bg-gray-200">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(deptData.riskDistribution.low / deptData.analysesCompleted) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-yellow-500" 
                        style={{ width: `${(deptData.riskDistribution.medium / deptData.analysesCompleted) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(deptData.riskDistribution.high / deptData.analysesCompleted) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-600">Correlación Productividad</div>
                      <div className="text-sm font-medium text-gray-900">
                        {(deptData.productivityCorrelation * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Ausentismo</div>
                      <div className="text-sm font-medium text-gray-900">
                        {deptData.absenteeismRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Biomarker Aggregates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('biomarkers')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">Biomarcadores Agregados</h3>
            </div>
            {expandedSections.biomarkers ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.biomarkers && (
            <div className="px-4 pb-4 space-y-4">
              {Object.entries(companyStats.biomarkerAggregates).map(([key, data]) => {
                const getTrendIcon = (trend) => {
                  switch (trend) {
                    case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />;
                    case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-600" />;
                    default: return <Activity className="w-4 h-4 text-gray-600" />;
                  }
                };

                const getIcon = (key) => {
                  switch (key) {
                    case 'stressLevels': return <Brain className="w-5 h-5 text-red-600" />;
                    case 'fatigueIndex': return <Moon className="w-5 h-5 text-purple-600" />;
                    case 'sleepQuality': return <Moon className="w-5 h-5 text-blue-600" />;
                    case 'cardiovascularRisk': return <Heart className="w-5 h-5 text-red-600" />;
                    default: return <Activity className="w-5 h-5 text-gray-600" />;
                  }
                };

                const getName = (key) => {
                  switch (key) {
                    case 'stressLevels': return 'Niveles de Estrés';
                    case 'fatigueIndex': return 'Índice de Fatiga';
                    case 'sleepQuality': return 'Calidad del Sueño';
                    case 'cardiovascularRisk': return 'Riesgo Cardiovascular';
                    default: return key;
                  }
                };

                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getIcon(key)}
                      <div>
                        <div className="font-medium text-gray-900">{getName(key)}</div>
                        <div className="text-sm text-gray-600">Promedio: {data.average}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(data.trend)}
                      <span className="text-sm text-gray-600 capitalize">{data.trend}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Exportar Reporte</span>
          </button>

          <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Programar Análisis</span>
          </button>
        </div>

        {/* Last Updated */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Última actualización: {timestampService.getRelativeTime(companyStats.lastUpdated)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;