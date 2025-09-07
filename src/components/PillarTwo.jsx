import React, { useState } from 'react';
import { Building, Users, TrendingDown, TrendingUp, AlertTriangle, Award, Target, BarChart3, Activity, Clock, Calendar, Brain, Heart, Zap } from 'lucide-react';

const PillarTwo = () => {
  const [timeRange, setTimeRange] = useState('monthly');

  // Enhanced company health data with KPIs and time variations
  const companyKPIs = {
    totalEmployees: 2847,
    participationRate: 0.73,
    totalAnalysis: 1923,
    monthlyGrowth: 0.12,
    weeklyAnalysis: 487,
    dailyAverage: 69,
    lastUpdateTime: '2024-01-15 14:30'
  };

  const healthIndicatorsKPI = [
    {
      name: 'Análisis Completados',
      current: 1923,
      target: 2200,
      trend: '+12%',
      variation: 'monthly',
      status: 'good',
      lastWeek: 487,
      avgDaily: 69,
      peakHour: '10:00-11:00 AM'
    },
    {
      name: 'Participación Activa',
      current: '73%',
      target: '80%',
      trend: '+8%',
      variation: 'monthly',
      status: 'good',
      lastWeek: '71%',
      avgDaily: '2.1%',
      peakHour: '9:00-10:00 AM'
    },
    {
      name: 'Detección Temprana',
      current: 156,
      target: 120,
      trend: '+23%',
      variation: 'monthly',
      status: 'excellent',
      lastWeek: 38,
      avgDaily: 5.4,
      peakHour: 'Martes 2:00 PM'
    },
    {
      name: 'Tiempo Promedio Análisis',
      current: '4.2 min',
      target: '5.0 min',
      trend: '-15%',
      variation: 'weekly',
      status: 'excellent',
      lastWeek: '4.5 min',
      avgDaily: '4.1 min',
      peakHour: 'Lunes AM'
    },
    {
      name: 'Alertas de Salud',
      current: 23,
      target: 30,
      trend: '-15%',
      variation: 'weekly',
      status: 'good',
      lastWeek: 27,
      avgDaily: 3.3,
      peakHour: 'Viernes PM'
    },
    {
      name: 'Satisfacción Usuario',
      current: '8.7/10',
      target: '8.5/10',
      trend: '+3%',
      variation: 'monthly',
      status: 'excellent',
      lastWeek: '8.6/10',
      avgDaily: '8.7/10',
      peakHour: 'Constante'
    }
  ];

  const departmentAnalysis = [
    {
      department: 'Recursos Humanos',
      employees: 45,
      analysisCompleted: 42,
      participationRate: 93.3,
      avgHealthScore: 8.4,
      riskAlerts: 2,
      trend: 'improving',
      lastAnalysis: '2024-01-15'
    },
    {
      department: 'Tecnología',
      employees: 128,
      analysisCompleted: 98,
      participationRate: 76.6,
      avgHealthScore: 7.9,
      riskAlerts: 8,
      trend: 'stable',
      lastAnalysis: '2024-01-15'
    },
    {
      department: 'Ventas',
      employees: 89,
      analysisCompleted: 71,
      participationRate: 79.8,
      avgHealthScore: 8.1,
      riskAlerts: 5,
      trend: 'improving',
      lastAnalysis: '2024-01-14'
    },
    {
      department: 'Operaciones',
      employees: 156,
      analysisCompleted: 89,
      participationRate: 57.1,
      avgHealthScore: 7.2,
      riskAlerts: 12,
      trend: 'needs_attention',
      lastAnalysis: '2024-01-13'
    },
    {
      department: 'Administración',
      employees: 67,
      analysisCompleted: 58,
      participationRate: 86.6,
      avgHealthScore: 8.3,
      riskAlerts: 3,
      trend: 'stable',
      lastAnalysis: '2024-01-15'
    }
  ];

  const timeVariations = {
    hourly: [
      { hour: '08:00', analyses: 45, participation: 68 },
      { hour: '09:00', analyses: 89, participation: 82 },
      { hour: '10:00', analyses: 124, participation: 91 },
      { hour: '11:00', analyses: 98, participation: 76 },
      { hour: '14:00', analyses: 67, participation: 71 },
      { hour: '15:00', analyses: 78, participation: 69 },
      { hour: '16:00', analyses: 45, participation: 58 }
    ],
    weekly: [
      { day: 'Lunes', analyses: 387, participation: 78 },
      { day: 'Martes', analyses: 423, participation: 82 },
      { day: 'Miércoles', analyses: 398, participation: 76 },
      { day: 'Jueves', analyses: 356, participation: 71 },
      { day: 'Viernes', analyses: 289, participation: 65 }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendColor = (trend) => {
    if (trend.startsWith('+')) return 'text-green-600';
    if (trend.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getDepartmentTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'needs_attention':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Building className="w-6 h-6 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Análisis Empresarial de Salud</h1>
          </div>
          <div className="text-sm text-gray-500">
            Última actualización: {companyKPIs.lastUpdateTime}
          </div>
        </div>

        {/* Real-time KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8" />
              <span className="text-2xl font-bold">{companyKPIs.totalEmployees}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Empleados Totales</h3>
            <p className="text-blue-100 text-sm">Personal activo en plataforma</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-8 h-8" />
              <span className="text-2xl font-bold">{companyKPIs.totalAnalysis}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Análisis Totales</h3>
            <div className="flex items-center text-green-100 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{(companyKPIs.monthlyGrowth * 100).toFixed(0)}% este mes
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8" />
              <span className="text-2xl font-bold">{(companyKPIs.participationRate * 100).toFixed(0)}%</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Participación</h3>
            <p className="text-purple-100 text-sm">Meta: 80% | Actual: Bueno</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8" />
              <span className="text-2xl font-bold">{companyKPIs.dailyAverage}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Promedio Diario</h3>
            <p className="text-orange-100 text-sm">Análisis por día</p>
          </div>
        </div>
      </div>

      {/* KPI Indicators Grid */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">KPIs Principales de Lectura y Análisis</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('daily')}
              className={`px-3 py-1 rounded text-sm ${timeRange === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Diario
            </button>
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-3 py-1 rounded text-sm ${timeRange === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Semanal
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-3 py-1 rounded text-sm ${timeRange === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Mensual
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthIndicatorsKPI.map((kpi, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getStatusColor(kpi.status)}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">{kpi.name}</h4>
                <div className="flex items-center space-x-1">
                  <span className={`text-xs font-medium ${getTrendColor(kpi.trend)}`}>
                    {kpi.trend}
                  </span>
                  {kpi.trend.startsWith('+') ? 
                    <TrendingUp className="w-3 h-3 text-green-500" /> : 
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  }
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold">{kpi.current}</span>
                  <span className="text-xs text-gray-600">/ {kpi.target}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Última semana:</span>
                  <span className="font-medium">{kpi.lastWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Promedio diario:</span>
                  <span className="font-medium">{kpi.avgDaily}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pico de actividad:</span>
                  <span className="font-medium">{kpi.peakHour}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Users className="w-6 h-6 text-green-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Análisis por Departamento</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Departamento</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Empleados</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Análisis</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Participación</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Puntuación</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Alertas</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Tendencia</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Último Análisis</th>
              </tr>
            </thead>
            <tbody>
              {departmentAnalysis.map((dept, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{dept.department}</td>
                  <td className="text-center py-3 px-4">{dept.employees}</td>
                  <td className="text-center py-3 px-4">
                    <span className="font-medium">{dept.analysisCompleted}</span>
                    <span className="text-gray-500">/{dept.employees}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-medium ${
                      dept.participationRate >= 80 ? 'text-green-600' : 
                      dept.participationRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {dept.participationRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-medium text-blue-600">{dept.avgHealthScore}/10</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dept.riskAlerts <= 3 ? 'bg-green-100 text-green-800' :
                      dept.riskAlerts <= 7 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {dept.riskAlerts}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    {getDepartmentTrendIcon(dept.trend)}
                  </td>
                  <td className="text-center py-3 px-4 text-gray-600">{dept.lastAnalysis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Variations */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Variaciones por Hora</h3>
          </div>
          
          <div className="space-y-3">
            {timeVariations.hourly.map((hour, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{hour.hour}</span>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">{hour.analyses} análisis</div>
                    <div className="text-xs text-gray-600">{hour.participation}% participación</div>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(hour.analyses / 124) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Variaciones Semanales</h3>
          </div>
          
          <div className="space-y-3">
            {timeVariations.weekly.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{day.day}</span>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">{day.analyses} análisis</div>
                    <div className="text-xs text-gray-600">{day.participation}% participación</div>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(day.analyses / 423) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Recommendations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Award className="w-6 h-6 text-yellow-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Recomendaciones Estratégicas</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">🚨 Acción Inmediata - Departamento Operaciones</h4>
            <p className="text-sm text-gray-700 mb-2">
              Participación del 57.1% está por debajo del objetivo (80%). 12 alertas de riesgo detectadas.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Implementar incentivos específicos para este departamento</li>
              <li>• Revisar horarios de análisis más convenientes</li>
              <li>• Capacitación personalizada sobre beneficios</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ Mejores Prácticas - RRHH</h4>
            <p className="text-sm text-gray-700 mb-2">
              93.3% de participación, puntuación promedio 8.4/10. Modelo a replicar.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Documentar estrategias exitosas</li>
              <li>• Compartir metodología con otros departamentos</li>
              <li>• Reconocimiento público del equipo</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📊 Optimización de Horarios</h4>
            <p className="text-sm text-gray-700 mb-2">
              Pico de actividad entre 10:00-11:00 AM. Optimizar recursos en estos horarios.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Aumentar capacidad de análisis en horas pico</li>
              <li>• Promocionar horarios de menor demanda</li>
              <li>• Implementar sistema de citas programadas</li>
            </ul>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">🎯 Meta Trimestral</h4>
            <p className="text-sm text-gray-700 mb-2">
              Objetivo: Alcanzar 80% de participación global y reducir alertas a menos de 15 por departamento.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Campaña de concientización empresa-wide</li>
              <li>• Gamificación con premios por participación</li>
              <li>• Reportes mensuales por departamento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PillarTwo;