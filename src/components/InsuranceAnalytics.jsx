import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, AlertTriangle, Shield, DollarSign, Users, Activity, Eye, Filter } from 'lucide-react';
import { insuranceAnalytics } from '../data/medicalCareData';

const InsuranceAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('utilization');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const ResourceUtilizationChart = () => {
    const data = insuranceAnalytics.resourceUtilization.monthly.topSpecialties.map(specialty => ({
      name: specialty.name,
      percentage: specialty.percentage,
      cost: specialty.cost / 1000000 // Convert to millions
    }));

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Utilización por Especialidad</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'percentage' ? `${value}%` : `₡${value}M`,
                name === 'percentage' ? 'Porcentaje' : 'Costo (Millones)'
              ]}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="percentage" fill="#8884d8" name="Porcentaje de Uso" />
            <Bar yAxisId="right" dataKey="cost" fill="#82ca9d" name="Costo Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const SeasonalityChart = () => {
    const data = Object.entries(insuranceAnalytics.resourceUtilization.patterns.seasonality).map(([month, data]) => ({
      month,
      claims: data.claims,
      avgCost: data.avgCost / 1000, // Convert to thousands
      trend: data.trend
    }));

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estacionalidad de Reclamos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'claims' ? value : `₡${value}K`,
                name === 'claims' ? 'Reclamos' : 'Costo Promedio'
              ]}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="claims" stroke="#8884d8" name="Número de Reclamos" />
            <Line yAxisId="right" type="monotone" dataKey="avgCost" stroke="#82ca9d" name="Costo Promedio (Miles)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const AgeGroupAnalysis = () => {
    const data = Object.entries(insuranceAnalytics.resourceUtilization.patterns.ageGroups).map(([age, data]) => ({
      ageGroup: age,
      utilization: data.utilization * 100,
      avgCost: data.avgCost / 1000,
      issues: data.commonIssues.join(', ')
    }));

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis por Grupo Etario</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="utilization" name="Utilización %" />
            <YAxis dataKey="avgCost" name="Costo Promedio (K)" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow">
                      <p className="font-semibold">{data.ageGroup}</p>
                      <p>Utilización: {data.utilization.toFixed(1)}%</p>
                      <p>Costo Promedio: ₡{data.avgCost}K</p>
                      <p className="text-sm text-gray-600">Problemas comunes: {data.issues}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter dataKey="avgCost" fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const DoctorClinicNetwork = () => {
    const networks = insuranceAnalytics.doctorClinicRelationships.networks;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Red Doctor-Clínica</h3>
        <div className="space-y-4">
          {networks.map((network, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Doctor {network.doctorId}</h4>
                <span className="text-sm text-gray-500">{network.clinicIds.length} clínicas</span>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{(network.exclusivity * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Exclusividad</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{(network.referralRate * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Tasa Referencia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{network.patientSatisfaction}</div>
                  <div className="text-sm text-gray-600">Satisfacción</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{(network.costEfficiency * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Eficiencia</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TreatmentEffectiveness = () => {
    const data = insuranceAnalytics.treatmentEffectiveness.outcomes.map(outcome => ({
      treatment: outcome.treatmentId,
      successRate: outcome.successRate * 100,
      costPerSuccess: outcome.costPerSuccess / 1000,
      satisfaction: outcome.patientSatisfaction,
      relapseRate: outcome.relapseRate * 100
    }));

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Efectividad de Tratamientos</h3>
        <div className="space-y-4">
          {data.map((treatment, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">{treatment.treatment}</h4>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{treatment.successRate.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Éxito</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">₡{treatment.costPerSuccess.toFixed(0)}K</div>
                  <div className="text-sm text-gray-600">Costo/Éxito</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{treatment.satisfaction}</div>
                  <div className="text-sm text-gray-600">Satisfacción</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{treatment.relapseRate.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Recaída</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FraudRiskIndicators = () => {
    const indicators = insuranceAnalytics.riskAssessment.fraudIndicators;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
          Indicadores de Riesgo de Fraude
        </h3>
        <div className="space-y-4">
          {indicators.map((indicator, index) => (
            <div key={index} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-red-800">{indicator.type}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  indicator.riskLevel === 'Alto' ? 'bg-red-200 text-red-800' :
                  indicator.riskLevel === 'Medio' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-green-200 text-green-800'
                }`}>
                  {indicator.riskLevel}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{indicator.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Casos Detectados:</span>
                  <span className="ml-2">{indicator.detectedCases}</span>
                </div>
                <div>
                  <span className="font-medium">Falsos Positivos:</span>
                  <span className="ml-2">{(indicator.falsePositives * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PreventiveOpportunities = () => {
    const opportunities = insuranceAnalytics.riskAssessment.preventiveOpportunities;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-500" />
          Oportunidades Preventivas
        </h3>
        <div className="space-y-4">
          {opportunities.map((opportunity, index) => (
            <div key={index} className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <h4 className="font-semibold text-green-800 mb-2">{opportunity.condition}</h4>
              <p className="text-gray-700 mb-3">{opportunity.targetPopulation}</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">₡{opportunity.interventionCost.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Costo Intervención</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">₡{opportunity.potentialSavings.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Ahorro Potencial</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{opportunity.roi}x</div>
                  <div className="text-sm text-gray-600">ROI</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const KPICards = () => {
    const kpis = insuranceAnalytics.resourceUtilization.monthly;
    
    return (
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reclamos Totales</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.totalClaims.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Costo Total</p>
              <p className="text-2xl font-bold text-gray-900">₡{(kpis.totalCost / 1000000).toFixed(0)}M</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Costo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">₡{kpis.averageClaimCost.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Riesgo de Fraude</p>
              <p className="text-2xl font-bold text-gray-900">{(kpis.fraudRisk * 100).toFixed(1)}%</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Análisis de Recursos de Seguro</h2>
          <p className="text-gray-600">Monitoreo y análisis del uso de recursos médicos</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
          </select>
          
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="utilization">Utilización</option>
            <option value="cost">Costos</option>
            <option value="effectiveness">Efectividad</option>
          </select>
        </div>
      </div>

      <KPICards />

      <div className="grid md:grid-cols-2 gap-6">
        <ResourceUtilizationChart />
        <SeasonalityChart />
      </div>

      <AgeGroupAnalysis />

      <div className="grid md:grid-cols-2 gap-6">
        <DoctorClinicNetwork />
        <TreatmentEffectiveness />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FraudRiskIndicators />
        <PreventiveOpportunities />
      </div>
    </div>
  );
};

export default InsuranceAnalytics;