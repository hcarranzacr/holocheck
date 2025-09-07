import React from 'react';
import { Shield, TrendingDown, Database, MapPin, DollarSign, Users2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { insuranceData } from '../data/healthData';

const PillarThree = () => {
  const { openDataSources, biosignalsAggregated, actuarialAdjustments, riskCohorts, totalLives, region } = insuranceData;

  const RiskCohortCard = ({ cohort, index }) => {
    const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500'];
    const textColors = ['text-green-800', 'text-yellow-800', 'text-red-800'];
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: colors[index]?.replace('bg-', '') || '#gray' }}>
        <div className="flex items-center justify-between mb-4">
          <h4 className={`text-lg font-semibold ${textColors[index]}`}>{cohort.name}</h4>
          <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${colors[index]}`}>
            {(cohort.percentage * 100).toFixed(0)}%
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-3">{cohort.characteristics}</p>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">Ajuste de Prima:</span>
          <span className={`font-semibold ${cohort.premiumDiscount ? 'text-green-600' : 'text-red-600'}`}>
            {cohort.premiumDiscount || cohort.premiumSurcharge}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Shield className="mr-3 text-green-500" />
          Pilar 3: Modelo Actuarial Asegurador
        </h2>
        <p className="text-gray-600 mb-6">
          Integración de datos abiertos con biosignales agregados para ajuste actuarial y nuevos productos
        </p>

        {/* Portfolio Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Users2 className="w-8 h-8 mr-3" />
              <h3 className="text-lg font-semibold">Vidas Aseguradas</h3>
            </div>
            <div className="text-3xl font-bold">{totalLives.toLocaleString()}</div>
            <p className="text-green-100">Cartera total</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <MapPin className="w-8 h-8 mr-3" />
              <h3 className="text-lg font-semibold">Región</h3>
            </div>
            <div className="text-2xl font-bold">{region}</div>
            <p className="text-blue-100">Mercado principal</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <TrendingDown className="w-8 h-8 mr-3" />
              <h3 className="text-lg font-semibold">Reducción Siniestralidad</h3>
            </div>
            <div className="text-2xl font-bold">{actuarialAdjustments.frequencySeverityReduction}</div>
            <p className="text-purple-100">Proyectado 12-24m</p>
          </div>
        </div>

        {/* Open Data Sources Integration */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Integración de Datos Abiertos</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                <AlertCircle className="mr-2" />
                Epidemiología Local
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Incidencia Dengue:</span>
                  <span className="font-semibold">{(openDataSources.epidemiological.dengueIncidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Casos IRAG:</span>
                  <span className="font-semibold">{(openDataSources.epidemiological.iragCases * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EpiScore:</span>
                  <span className="font-semibold text-red-600">{openDataSources.epidemiological.epiScore.toFixed(1)}</span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Alertas Estacionales:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {openDataSources.epidemiological.seasonalAlerts.map((alert, index) => (
                      <span key={index} className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs">
                        {alert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                <MapPin className="mr-2" />
                Accidentes de Tránsito
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa Accidentes:</span>
                  <span className="font-semibold">{(openDataSources.traffic.accidentRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RoadRisk Score:</span>
                  <span className="font-semibold text-orange-600">{openDataSources.traffic.roadRiskScore.toFixed(1)}</span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Cantones Alto Riesgo:</p>
                  <div className="mt-2 space-y-1">
                    {openDataSources.traffic.highRiskCantons.map((canton, index) => (
                      <div key={index} className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                        {canton}
                      </div>
                    ))}
                  </div>
                </div>
                {openDataSources.traffic.trafficCampaignNeeded && (
                  <div className="mt-3 p-2 bg-orange-200 rounded text-sm text-orange-800">
                    ⚠️ Campaña vial recomendada
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <Database className="mr-2" />
                Demografía y Socioeconómico
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Edad Promedio:</span>
                  <span className="font-semibold">{openDataSources.demographic.averageAge} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Índice Pobreza:</span>
                  <span className="font-semibold">{(openDataSources.demographic.povertyIndex * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel Educación:</span>
                  <span className="font-semibold">{(openDataSources.demographic.educationLevel * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SocioRisk:</span>
                  <span className="font-semibold text-blue-600">{openDataSources.demographic.socioRisk.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregated Biosignals */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Biosignales Agregados de la Cartera</h3>
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg">
            <div className="grid md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{biosignalsAggregated.averageRiskScore.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Score Riesgo Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">{(biosignalsAggregated.cardiovascularRisk * 100).toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Riesgo Cardiovascular</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{(biosignalsAggregated.metabolicRisk * 100).toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Riesgo Metabólico</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{(biosignalsAggregated.mentalHealthRisk * 100).toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Riesgo Salud Mental</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{biosignalsAggregated.bioScore.toFixed(2)}</div>
                <div className="text-sm text-gray-600">BioScore General</div>
                <div className={`text-xs mt-1 ${biosignalsAggregated.trendDirection === 'improving' ? 'text-green-600' : 'text-red-600'}`}>
                  {biosignalsAggregated.trendDirection === 'improving' ? '↗️ Mejorando' : '↘️ Empeorando'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Cohorts */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Estratificación de Riesgo por Cohortes</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {riskCohorts.map((cohort, index) => (
              <RiskCohortCard key={index} cohort={cohort} index={index} />
            ))}
          </div>
        </div>

        {/* Actuarial Adjustments */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Ajustes Actuariales y Nuevos Productos</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <CheckCircle2 className="mr-2" />
                Beneficios Cuantificados
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reducción Siniestralidad:</span>
                  <span className="font-semibold text-green-600">{actuarialAdjustments.frequencySeverityReduction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plazo Esperado:</span>
                  <span className="font-semibold">{actuarialAdjustments.expectedTimeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ajuste Prima:</span>
                  <span className="font-semibold text-green-600">{actuarialAdjustments.premiumAdjustment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mejora Retención:</span>
                  <span className="font-semibold text-green-600">{actuarialAdjustments.retentionImprovement}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <DollarSign className="mr-2" />
                Nuevas Oportunidades de Producto
              </h4>
              <div className="space-y-3">
                {actuarialAdjustments.newProductOpportunities.map((product, index) => (
                  <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-500">
                    <div className="font-semibold text-gray-800">{product}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {product.includes('Microseguros') && 'Productos accesibles con evaluación semestral'}
                      {product.includes('Vida interactiva') && 'Underwriting simplificado con descuentos por hábitos'}
                      {product.includes('Wellness') && 'Programas corporativos con certificación empresa saludable'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Roadmap */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-6">Hoja de Ruta de Implementación</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Q1</div>
              <div className="text-sm opacity-90">Acuerdos CR + MVP técnico</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Q2</div>
              <div className="text-sm opacity-90">Piloto controlado + telemedicina</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Q3</div>
              <div className="text-sm opacity-90">Expansión PA + federated learning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Q4</div>
              <div className="text-sm opacity-90">Región SV/GT + resultados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PillarThree;