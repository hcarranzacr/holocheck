import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, Eye, TrendingUp, User, Clock, Activity, Heart, Zap } from 'lucide-react';
import dataStorageService from '../services/dataStorage';

const EvaluationHistory = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    quality: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [storageStats, setStorageStats] = useState(null);

  // Load real evaluations from localStorage
  useEffect(() => {
    const loadEvaluations = () => {
      try {
        setLoading(true);
        console.log('🔍 Cargando evaluaciones desde localStorage...');
        
        // Get all evaluations from storage service
        const storedEvaluations = dataStorageService.getAllEvaluations();
        console.log('📊 Evaluaciones encontradas:', storedEvaluations.length);
        
        // Get storage statistics
        const stats = dataStorageService.getStorageStats();
        setStorageStats(stats);
        
        // Transform evaluations for display
        const transformedEvaluations = storedEvaluations.map(evaluation => ({
          id: evaluation.id,
          timestamp: evaluation.timestamp,
          date: new Date(evaluation.timestamp).toLocaleDateString('es-ES'),
          time: new Date(evaluation.timestamp).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          type: 'Análisis Biométrico',
          status: evaluation.data?.analysisQuality === 'Insuficiente' ? 'Incompleto' : 'Completado',
          quality: evaluation.data?.analysisQuality || 'Desconocida',
          heartRate: evaluation.data?.heartRate || 'N/A',
          heartRateVariability: evaluation.data?.heartRateVariability || 'N/A',
          rmssd: evaluation.data?.rmssd || 'N/A',
          sdnn: evaluation.data?.sdnn || 'N/A',
          fundamentalFrequency: evaluation.data?.fundamentalFrequency || 'N/A',
          jitter: evaluation.data?.jitter || 'N/A',
          shimmer: evaluation.data?.shimmer || 'N/A',
          completedBiomarkers: evaluation.data?.completedBiomarkers || 0,
          totalBiomarkers: evaluation.data?.totalBiomarkers || 36,
          duration: evaluation.data?.duration || 0,
          recommendations: evaluation.data?.recommendations || [],
          version: evaluation.version || 'N/A'
        }));

        // Sort by date (newest first)
        const sortedEvaluations = transformedEvaluations.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );

        console.log('✅ Evaluaciones transformadas:', sortedEvaluations.length);
        setEvaluations(sortedEvaluations);
        setFilteredEvaluations(sortedEvaluations);
      } catch (error) {
        console.error('❌ Error cargando evaluaciones:', error);
        setEvaluations([]);
        setFilteredEvaluations([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvaluations();
  }, []);

  // Filter evaluations based on selected filters
  useEffect(() => {
    let filtered = evaluations;

    if (filters.quality !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.quality === filters.quality);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.status === filters.status);
    }

    if (filters.dateRange !== 'all') {
      const today = new Date();
      let startDate = new Date();
      
      switch (filters.dateRange) {
        case '7days':
          startDate.setDate(today.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(today.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(today.getDate() - 90);
          break;
        default:
          startDate = new Date('2000-01-01');
      }
      
      filtered = filtered.filter(evaluation => new Date(evaluation.timestamp) >= startDate);
    }

    setFilteredEvaluations(filtered);
    setCurrentPage(1);
  }, [filters, evaluations]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Fecha,Hora,Tipo,Estado,Calidad,FC (BPM),HRV,RMSSD,SDNN,F0 (Hz),Jitter (%),Shimmer (%),Biomarcadores,Duración (s),Versión\n"
      + filteredEvaluations.map(evaluation => 
          `${evaluation.date},${evaluation.time},${evaluation.type},${evaluation.status},${evaluation.quality},${evaluation.heartRate},${evaluation.heartRateVariability},${evaluation.rmssd},${evaluation.sdnn},${evaluation.fundamentalFrequency},${evaluation.jitter},${evaluation.shimmer},"${evaluation.completedBiomarkers}/${evaluation.totalBiomarkers}",${evaluation.duration},${evaluation.version}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `holocheck_historial_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllData = () => {
    if (window.confirm('¿Está seguro de que desea eliminar todo el historial? Esta acción no se puede deshacer.')) {
      dataStorageService.clearAllEvaluations();
      setEvaluations([]);
      setFilteredEvaluations([]);
      setStorageStats(null);
      console.log('🗑️ Historial eliminado completamente');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvaluations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Excelente':
        return 'text-green-600 bg-green-100';
      case 'Buena':
        return 'text-blue-600 bg-blue-100';
      case 'Aceptable':
        return 'text-yellow-600 bg-yellow-100';
      case 'Insuficiente':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado':
        return 'text-green-600 bg-green-100';
      case 'Incompleto':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatBiomarkerValue = (value) => {
    if (value === null || value === undefined || value === 'N/A') return 'N/A';
    if (typeof value === 'number') {
      return value.toFixed(1);
    }
    return value;
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando historial...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Clock className="mr-2" />
            Historial de Evaluaciones
          </h2>
          <p className="text-gray-600 mt-1">
            Registro completo de todas las evaluaciones biométricas almacenadas localmente
          </p>
          {storageStats && (
            <div className="text-sm text-gray-500 mt-2">
              {storageStats.totalEvaluations} evaluaciones • Almacenamiento: {storageStats.storageType}
              {storageStats.oldestEvaluation && (
                <> • Desde: {new Date(storageStats.oldestEvaluation).toLocaleDateString('es-ES')}</>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </button>
          <button
            onClick={clearAllData}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🗑️ Limpiar Todo
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline mr-1 h-4 w-4" />
            Período
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los períodos</option>
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="90days">Últimos 90 días</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Activity className="inline mr-1 h-4 w-4" />
            Calidad
          </label>
          <select
            value={filters.quality}
            onChange={(e) => handleFilterChange('quality', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las calidades</option>
            <option value="Excelente">Excelente</option>
            <option value="Buena">Buena</option>
            <option value="Aceptable">Aceptable</option>
            <option value="Insuficiente">Insuficiente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="inline mr-1 h-4 w-4" />
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="Completado">Completado</option>
            <option value="Incompleto">Incompleto</option>
          </select>
        </div>

        <div className="flex items-end">
          <div className="text-sm text-gray-600">
            <strong>{filteredEvaluations.length}</strong> evaluaciones encontradas
          </div>
        </div>
      </div>

      {/* No Data Message */}
      {filteredEvaluations.length === 0 && !loading && (
        <div className="text-center py-12">
          <Activity className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay evaluaciones</h3>
          <p className="mt-1 text-sm text-gray-500">
            {evaluations.length === 0 
              ? 'Aún no se han realizado evaluaciones biométricas.'
              : 'No se encontraron evaluaciones con los filtros seleccionados.'
            }
          </p>
        </div>
      )}

      {/* Results Table */}
      {filteredEvaluations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado/Calidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Biomarcadores Cardiovasculares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Biomarcadores Vocales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{evaluation.date}</div>
                    <div className="text-sm text-gray-500">{evaluation.time}</div>
                    <div className="text-xs text-gray-400">
                      {Math.round(evaluation.duration)}s • {evaluation.version}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(evaluation.status)} mb-1`}>
                      {evaluation.status}
                    </span>
                    <br />
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(evaluation.quality)}`}>
                      {evaluation.quality}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center mb-1">
                      <Heart className="h-3 w-3 text-red-500 mr-1" />
                      FC: {formatBiomarkerValue(evaluation.heartRate)} BPM
                    </div>
                    <div>HRV: {formatBiomarkerValue(evaluation.heartRateVariability)}</div>
                    <div className="text-xs text-gray-500">
                      RMSSD: {formatBiomarkerValue(evaluation.rmssd)} • 
                      SDNN: {formatBiomarkerValue(evaluation.sdnn)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center mb-1">
                      <Zap className="h-3 w-3 text-blue-500 mr-1" />
                      F₀: {formatBiomarkerValue(evaluation.fundamentalFrequency)} Hz
                    </div>
                    <div className="text-xs text-gray-500">
                      Jitter: {formatBiomarkerValue(evaluation.jitter)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Shimmer: {formatBiomarkerValue(evaluation.shimmer)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {evaluation.completedBiomarkers}/{evaluation.totalBiomarkers}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(evaluation.completedBiomarkers / evaluation.totalBiomarkers) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((evaluation.completedBiomarkers / evaluation.totalBiomarkers) * 100)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-green-600 hover:text-green-900"
                      title="Ver tendencias"
                    >
                      <TrendingUp className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredEvaluations.length)} de {filteredEvaluations.length} resultados
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 border border-gray-300 rounded-md ${
                  currentPage === index + 1 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {filteredEvaluations.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {filteredEvaluations.length}
            </div>
            <div className="text-sm text-blue-800">Total Evaluaciones</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {filteredEvaluations.filter(e => e.status === 'Completado').length}
            </div>
            <div className="text-sm text-green-800">Completadas</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredEvaluations.filter(e => e.quality === 'Aceptable' || e.quality === 'Buena' || e.quality === 'Excelente').length}
            </div>
            <div className="text-sm text-yellow-800">Calidad Aceptable+</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(filteredEvaluations.reduce((acc, e) => acc + (e.completedBiomarkers / e.totalBiomarkers), 0) / filteredEvaluations.length * 100) || 0}%
            </div>
            <div className="text-sm text-purple-800">Promedio Biomarcadores</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationHistory;