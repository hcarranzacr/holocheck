import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, Eye, TrendingUp, User, Clock } from 'lucide-react';

const EvaluationHistory = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    type: 'all',
    user: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockEvaluations = [
      {
        id: 1,
        date: '2024-01-15',
        time: '10:30 AM',
        user: 'Juan Pérez',
        type: 'Análisis Completo',
        status: 'Completado',
        heartRate: 72,
        bloodPressure: '120/80',
        stressLevel: 'Bajo',
        riskScore: 15,
        recommendations: 3
      },
      {
        id: 2,
        date: '2024-01-14',
        time: '2:15 PM',
        user: 'María García',
        type: 'Chequeo Rápido',
        status: 'Completado',
        heartRate: 68,
        bloodPressure: '118/75',
        stressLevel: 'Normal',
        riskScore: 12,
        recommendations: 2
      },
      {
        id: 3,
        date: '2024-01-13',
        time: '9:45 AM',
        user: 'Carlos López',
        type: 'Análisis de Voz',
        status: 'En Proceso',
        heartRate: 75,
        bloodPressure: '125/82',
        stressLevel: 'Medio',
        riskScore: 22,
        recommendations: 4
      },
      {
        id: 4,
        date: '2024-01-12',
        time: '4:20 PM',
        user: 'Ana Martínez',
        type: 'Análisis Facial',
        status: 'Completado',
        heartRate: 70,
        bloodPressure: '115/70',
        stressLevel: 'Bajo',
        riskScore: 8,
        recommendations: 1
      },
      {
        id: 5,
        date: '2024-01-11',
        time: '11:00 AM',
        user: 'Roberto Silva',
        type: 'Análisis Completo',
        status: 'Completado',
        heartRate: 78,
        bloodPressure: '130/85',
        stressLevel: 'Alto',
        riskScore: 35,
        recommendations: 6
      }
    ];
    setEvaluations(mockEvaluations);
    setFilteredEvaluations(mockEvaluations);
  }, []);

  // Filter evaluations based on selected filters
  useEffect(() => {
    let filtered = evaluations;

    if (filters.type !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.type === filters.type);
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
      
      filtered = filtered.filter(evaluation => new Date(evaluation.date) >= startDate);
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
      + "Fecha,Usuario,Tipo,Estado,Frecuencia Cardíaca,Presión Arterial,Nivel de Estrés,Puntuación de Riesgo,Recomendaciones\n"
      + filteredEvaluations.map(evaluation => 
          `${evaluation.date},${evaluation.user},${evaluation.type},${evaluation.status},${evaluation.heartRate},${evaluation.bloodPressure},${evaluation.stressLevel},${evaluation.riskScore},${evaluation.recommendations}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historial_evaluaciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvaluations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);

  const getRiskColor = (score) => {
    if (score <= 15) return 'text-green-600 bg-green-100';
    if (score <= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado':
        return 'text-green-600 bg-green-100';
      case 'En Proceso':
        return 'text-blue-600 bg-blue-100';
      case 'Pendiente':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Clock className="mr-2" />
            Historial de Evaluaciones
          </h2>
          <p className="text-gray-600 mt-1">
            Registro completo de todas las evaluaciones biométricas
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </button>
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
            <Filter className="inline mr-1 h-4 w-4" />
            Tipo de Análisis
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="Análisis Completo">Análisis Completo</option>
            <option value="Chequeo Rápido">Chequeo Rápido</option>
            <option value="Análisis de Voz">Análisis de Voz</option>
            <option value="Análisis Facial">Análisis Facial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline mr-1 h-4 w-4" />
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="Completado">Completado</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>

        <div className="flex items-end">
          <div className="text-sm text-gray-600">
            <strong>{filteredEvaluations.length}</strong> evaluaciones encontradas
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Métricas Clave
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Riesgo
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{evaluation.user}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{evaluation.type}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(evaluation.status)}`}>
                    {evaluation.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>FC: {evaluation.heartRate} bpm</div>
                  <div>PA: {evaluation.bloodPressure}</div>
                  <div>Estrés: {evaluation.stressLevel}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(evaluation.riskScore)}`}>
                    {evaluation.riskScore}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <TrendingUp className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            {filteredEvaluations.filter(e => e.riskScore <= 15).length}
          </div>
          <div className="text-sm text-yellow-800">Bajo Riesgo</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {filteredEvaluations.filter(e => e.riskScore > 30).length}
          </div>
          <div className="text-sm text-red-800">Alto Riesgo</div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationHistory;