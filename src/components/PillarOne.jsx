import React, { useState } from 'react';
import { Heart, Activity, Calendar, TrendingUp, Users, Clock, CheckCircle, AlertTriangle, Brain, Zap } from 'lucide-react';
import EmployeeHealthCheck from './EmployeeHealthCheck';

const PillarOne = () => {
  const [activeView, setActiveView] = useState('dashboard');

  // Mock data for employee dashboard
  const employeeStats = {
    totalAnalysis: 12,
    lastAnalysisDate: '2024-01-15',
    overallHealthScore: 8.4,
    riskLevel: 'Bajo',
    upcomingAppointments: 2,
    completedCheckups: 8,
    monthlyTrend: '+12%'
  };

  const recentAnalysis = [
    {
      date: '2024-01-15',
      type: 'Chequeo Completo',
      score: 8.4,
      status: 'Completado',
      keyFindings: ['Presión arterial normal', 'Frecuencia cardíaca estable', 'Niveles de estrés bajos']
    },
    {
      date: '2024-01-08',
      type: 'Análisis de Voz',
      score: 7.8,
      status: 'Completado',
      keyFindings: ['Indicadores respiratorios normales', 'Tono de voz estable']
    },
    {
      date: '2024-01-01',
      type: 'Biometría Facial',
      score: 8.9,
      status: 'Completado',
      keyFindings: ['Signos vitales óptimos', 'Expresión facial relajada']
    }
  ];

  const upcomingAppointments = [
    {
      date: '2024-01-22',
      time: '10:00 AM',
      type: 'Chequeo Preventivo',
      doctor: 'Dr. María Rodríguez',
      location: 'Clínica Central'
    },
    {
      date: '2024-01-29',
      time: '2:30 PM',
      type: 'Seguimiento Nutricional',
      doctor: 'Lic. Carlos Méndez',
      location: 'Centro de Bienestar'
    }
  ];

  const healthIndicators = [
    {
      name: 'Frecuencia Cardíaca',
      value: '72 BPM',
      trend: 'estable',
      status: 'normal',
      lastReading: '2024-01-15',
      change: '0%'
    },
    {
      name: 'Presión Arterial',
      value: '120/80 mmHg',
      trend: 'mejorando',
      status: 'normal',
      lastReading: '2024-01-15',
      change: '-3%'
    },
    {
      name: 'Nivel de Estrés',
      value: '25%',
      trend: 'mejorando',
      status: 'bajo',
      lastReading: '2024-01-15',
      change: '-8%'
    },
    {
      name: 'Calidad del Sueño',
      value: '8.2/10',
      trend: 'estable',
      status: 'bueno',
      lastReading: '2024-01-14',
      change: '+2%'
    },
    {
      name: 'Índice de Fatiga',
      value: '15%',
      trend: 'mejorando',
      status: 'bajo',
      lastReading: '2024-01-15',
      change: '-12%'
    },
    {
      name: 'Respiración',
      value: '16 RPM',
      trend: 'estable',
      status: 'normal',
      lastReading: '2024-01-15',
      change: '0%'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
      case 'bueno':
      case 'bajo':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'alerta':
      case 'medio':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critico':
      case 'alto':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend, change) => {
    if (trend === 'mejorando' || (change && change.startsWith('+'))) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === 'empeorando' || (change && change.startsWith('-') && !change.includes('estrés') && !change.includes('fatiga'))) {
      return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    } else {
      return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Análisis Totales</p>
              <p className="text-2xl font-bold text-blue-600">{employeeStats.totalAnalysis}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">{employeeStats.monthlyTrend} este mes</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Puntuación de Salud</p>
              <p className="text-2xl font-bold text-green-600">{employeeStats.overallHealthScore}/10</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">Nivel de riesgo: </span>
            <span className="text-sm font-medium text-green-600">{employeeStats.riskLevel}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximas Citas</p>
              <p className="text-2xl font-bold text-purple-600">{employeeStats.upcomingAppointments}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">Próxima: 22 Ene</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chequeos Completados</p>
              <p className="text-2xl font-bold text-orange-600">{employeeStats.completedCheckups}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">Último: {employeeStats.lastAnalysisDate}</span>
          </div>
        </div>
      </div>

      {/* Health Indicators Grid */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Activity className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Indicadores Principales de Salud</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthIndicators.map((indicator, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getStatusColor(indicator.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{indicator.name}</h4>
                {getTrendIcon(indicator.trend, indicator.change)}
              </div>
              <div className="mb-2">
                <span className="text-lg font-bold">{indicator.value}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Última lectura: {indicator.lastReading}</span>
                <span className={`font-medium ${
                  indicator.change.startsWith('+') ? 'text-green-600' : 
                  indicator.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {indicator.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Analysis and Appointments */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Zap className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Análisis Recientes</h3>
          </div>
          
          <div className="space-y-4">
            {recentAnalysis.map((analysis, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{analysis.type}</h4>
                    <p className="text-sm text-gray-600">{analysis.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">{analysis.score}/10</span>
                    <div className="flex items-center mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">{analysis.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Hallazgos principales:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {analysis.keyFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-center">
                        <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Próximas Citas</h3>
          </div>
          
          <div className="space-y-4">
            {upcomingAppointments.map((appointment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{appointment.type}</h4>
                    <p className="text-sm text-gray-600">{appointment.doctor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600">{appointment.date}</p>
                    <p className="text-xs text-gray-600">{appointment.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-600">{appointment.location}</span>
                </div>
              </div>
            ))}
            
            <button className="w-full bg-purple-50 border border-purple-200 text-purple-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
              Ver todas las citas
            </button>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={() => setActiveView('health-check')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
        >
          Realizar Nuevo Chequeo de Salud
        </button>
      </div>
    </div>
  );

  if (activeView === 'health-check') {
    return (
      <div>
        <div className="flex items-center mb-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-4 hover:bg-gray-600"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Chequeo de Salud</h1>
        </div>
        <EmployeeHealthCheck />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Users className="w-6 h-6 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-800">Monitoreo Personal de Salud</h1>
      </div>
      {renderDashboard()}
    </div>
  );
};

export default PillarOne;