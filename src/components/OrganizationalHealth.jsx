import React, { useState } from 'react';
import { Building, Users, TrendingUp, TrendingDown, BarChart3, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { organizationalHealthData, recommendationEngine } from '../data/longitudinalData';
import { companies, organizationalLevels } from '../data/authData';

const OrganizationalHealth = () => {
  const [selectedCompany, setSelectedCompany] = useState('company_001');
  const [selectedLevel, setSelectedLevel] = useState('direccion');
  
  const companyData = organizationalHealthData[selectedCompany];
  const levelData = companyData?.byLevel[selectedLevel];
  const company = companies.find(c => c.id === selectedCompany);

  const MetricCard = ({ title, value, trend, color, description, isPercentage = false }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        {trend && (
          <div className={`flex items-center ${trend.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-xs ml-1">{Math.abs(trend.change * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold ${color} mb-1`}>
        {isPercentage ? `${(value * 100).toFixed(1)}%` : value}
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );

  const RiskIndicator = ({ level, color, percentage }) => (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-sm font-medium">{level}</span>
      <span className="text-sm text-gray-500">{percentage}%</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Building className="mr-3 text-blue-500" />
          Salud Ocupacional por Estructura Organizacional
        </h2>
        <p className="text-gray-600 mb-6">
          Análisis anónimo y agregado por niveles organizacionales con seguimiento longitudinal
        </p>

        {/* Company and Level Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Empresa</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} - {company.industry}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel Organizacional</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="direccion">Dirección Ejecutiva</option>
              <option value="gerencia">Gerencias</option>
              <option value="jefatura">Jefaturas</option>
              <option value="areas">Áreas Operativas</option>
            </select>
          </div>
        </div>

        {/* Company Overview */}
        {company && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">{company.name}</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{company.employeeCount}</div>
                <div className="text-sm text-gray-600">Total Empleados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{company.industry}</div>
                <div className="text-sm text-gray-600">Industria</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{company.insuranceGroup}</div>
                <div className="text-sm text-gray-600">Grupo Asegurador</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {levelData ? `${(levelData.participationRate * 100).toFixed(0)}%` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Participación Nivel</div>
              </div>
            </div>
          </div>
        )}

        {/* Level-Specific Metrics */}
        {levelData && (
          <>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Métricas Anónimas - {company?.organizationalStructure[selectedLevel]?.name}
              </h3>
              <div className="grid md:grid-cols-5 gap-4">
                <MetricCard
                  title="Nivel de Estrés"
                  value={levelData.anonymizedMetrics.avgStressLevel}
                  trend={levelData.trends.stressLevel}
                  color="text-red-600"
                  description="Promedio agregado"
                  isPercentage={true}
                />
                <MetricCard
                  title="Riesgo Metabólico"
                  value={levelData.anonymizedMetrics.avgMetabolicRisk}
                  trend={levelData.trends.metabolicRisk}
                  color="text-orange-600"
                  description="Indicador compuesto"
                  isPercentage={true}
                />
                <MetricCard
                  title="Riesgo Cardiovascular"
                  value={levelData.anonymizedMetrics.avgCardiovascularRisk}
                  color="text-purple-600"
                  description="Evaluación agregada"
                  isPercentage={true}
                />
                <MetricCard
                  title="Calidad del Sueño"
                  value={levelData.anonymizedMetrics.sleepQuality}
                  color="text-blue-600"
                  description="Índice de descanso"
                  isPercentage={true}
                />
                <MetricCard
                  title="Riesgo Burnout"
                  value={levelData.anonymizedMetrics.burnoutRisk}
                  color="text-red-500"
                  description="Agotamiento laboral"
                  isPercentage={true}
                />
              </div>
            </div>

            {/* Recommendations for this Level */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Recomendaciones Específicas - {company?.organizationalStructure[selectedLevel]?.name}
              </h3>
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-3 gap-4">
                  {levelData.recommendations.map((rec, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-800">{rec}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Recomendación basada en análisis anónimo del nivel organizacional
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Departmental Breakdown */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Distribución por Departamentos</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4">Departamentos en este Nivel:</h4>
                    <div className="space-y-2">
                      {company?.organizationalStructure[selectedLevel]?.departments.map((dept, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded">
                          <span className="text-gray-700">{dept}</span>
                          <span className="text-sm text-gray-500">
                            ~{Math.floor(levelData.totalEmployees / company.organizationalStructure[selectedLevel].departments.length)} empleados
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4">Tendencias (3 meses):</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Participación:</span>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-600 font-semibold">
                            +{(levelData.trends.participation.change * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Reducción Estrés:</span>
                        <div className="flex items-center">
                          <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-600 font-semibold">
                            {(levelData.trends.stressLevel.change * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Mejora Metabólica:</span>
                        <div className="flex items-center">
                          <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-600 font-semibold">
                            {(levelData.trends.metabolicRisk.change * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Overall Company Trends */}
        {companyData && (
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-6">Tendencias Generales de la Empresa</h3>
            <div className="grid md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  +{(companyData.overallTrends.participationGrowth * 100).toFixed(1)}%
                </div>
                <div className="text-sm opacity-90">Crecimiento Participación</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  -{(companyData.overallTrends.stressReduction * 100).toFixed(1)}%
                </div>
                <div className="text-sm opacity-90">Reducción Estrés</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  -{(companyData.overallTrends.metabolicImprovement * 100).toFixed(1)}%
                </div>
                <div className="text-sm opacity-90">Mejora Metabólica</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  -{(companyData.overallTrends.absenteeismReduction * 100).toFixed(1)}%
                </div>
                <div className="text-sm opacity-90">Reducción Ausentismo</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  +{(companyData.overallTrends.productivityIncrease * 100).toFixed(1)}%
                </div>
                <div className="text-sm opacity-90">Aumento Productividad</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationalHealth;