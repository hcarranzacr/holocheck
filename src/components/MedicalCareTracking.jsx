import React, { useState } from 'react';
import { Calendar, MapPin, User, Stethoscope, FileText, Plus, Search, Filter, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { medicalCareData, medicalSpecialties, appointmentTypes, treatmentCategories } from '../data/medicalCareData';

const MedicalCareTracking = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: '',
    doctor: '',
    clinic: '',
    specialty: '',
    cost: '',
    diagnosis: '',
    treatments: '',
    satisfaction: 5
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate adding appointment
    console.log('New appointment:', formData);
    setShowAddForm(false);
    setFormData({
      date: '',
      time: '',
      type: '',
      doctor: '',
      clinic: '',
      specialty: '',
      cost: '',
      diagnosis: '',
      treatments: '',
      satisfaction: 5
    });
  };

  const AppointmentForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Registrar Nueva Cita Médica</h3>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de la Cita
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cita
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar tipo</option>
                {appointmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad
              </label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar especialidad</option>
                {medicalSpecialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Doctor
            </label>
            <input
              type="text"
              name="doctor"
              value={formData.doctor}
              onChange={handleInputChange}
              required
              placeholder="Dr./Dra. Nombre Completo"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Centro Médico/Clínica
            </label>
            <input
              type="text"
              name="clinic"
              value={formData.clinic}
              onChange={handleInputChange}
              required
              placeholder="Nombre del centro médico"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo de la Consulta (₡)
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              required
              placeholder="45000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnóstico/Motivo de Consulta
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              required
              placeholder="Descripción del diagnóstico o motivo de la consulta"
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tratamientos Recibidos
            </label>
            <textarea
              name="treatments"
              value={formData.treatments}
              onChange={handleInputChange}
              placeholder="Medicamentos, procedimientos, recomendaciones (separados por comas)"
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Satisfacción con la Atención (1-5)
            </label>
            <select
              name="satisfaction"
              value={formData.satisfaction}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">5 - Excelente</option>
              <option value="4">4 - Muy Buena</option>
              <option value="3">3 - Buena</option>
              <option value="2">2 - Regular</option>
              <option value="1">1 - Mala</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Registrar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AppointmentsList = () => (
    <div className="space-y-4">
      {medicalCareData.appointments.map((appointment) => (
        <div key={appointment.id} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{appointment.type}</h3>
                <p className="text-gray-600">{appointment.specialty}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              appointment.status === 'Completada' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {appointment.status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {appointment.date} a las {appointment.time}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                {appointment.doctor}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {appointment.clinic}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium text-gray-700">Costo:</span>
                <span className="ml-2">₡{appointment.cost.toLocaleString()}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Cobertura:</span>
                <span className="ml-2">{appointment.insuranceCoverage}%</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Satisfacción:</span>
                <span className="ml-2">{'⭐'.repeat(Math.floor(appointment.satisfaction))} {appointment.satisfaction}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="mb-2">
              <span className="font-medium text-gray-700">Diagnóstico:</span>
              <p className="text-gray-600 mt-1">{appointment.diagnosis}</p>
            </div>
            {appointment.treatments.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">Tratamientos:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {appointment.treatments.map((treatment, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {treatment}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const DoctorsDirectory = () => (
    <div className="grid md:grid-cols-2 gap-6">
      {medicalCareData.doctors.map((doctor) => (
        <div key={doctor.id} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
              <p className="text-blue-600 font-medium">{doctor.specialty}</p>
              <p className="text-sm text-gray-500">Licencia: {doctor.license}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{doctor.rating}</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Experiencia:</span>
              <span className="ml-2">{doctor.experience} años</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Clínicas:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {doctor.clinics.map((clinic, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {clinic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-medium text-gray-700">Costo Promedio:</span>
              <span className="ml-2">₡{doctor.averageCost.toLocaleString()}</span>
            </div>

            <div>
              <span className="font-medium text-gray-700">Seguros Aceptados:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {doctor.insuranceAccepted.map((insurance, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    {insurance}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ClinicsDirectory = () => (
    <div className="grid md:grid-cols-2 gap-6">
      {medicalCareData.clinics.map((clinic) => (
        <div key={clinic.id} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{clinic.name}</h3>
              <p className="text-blue-600 font-medium">{clinic.type}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {clinic.location}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{clinic.rating}</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Tiempo de Espera:</span>
              <span className="ml-2">{clinic.averageWaitTime} min promedio</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Especialidades:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {clinic.specialties.map((specialty, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-medium text-gray-700">Instalaciones:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {clinic.facilities.map((facility, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {facility}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-medium text-gray-700">Seguros Aceptados:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {clinic.insuranceAccepted.map((insurance, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    {insurance}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TreatmentsDatabase = () => (
    <div className="space-y-4">
      {medicalCareData.treatments.map((treatment) => (
        <div key={treatment.id} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{treatment.name}</h3>
              <p className="text-blue-600 font-medium">{treatment.category}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">{(treatment.effectiveness * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-500">Efectividad</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium text-gray-700">Costo Promedio:</span>
              <div className="text-lg font-semibold text-gray-800">₡{treatment.averageCost.toLocaleString()}</div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Duración:</span>
              <div className="text-lg font-semibold text-gray-800">{treatment.duration}</div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Cobertura Seguro:</span>
              <div className="text-lg font-semibold text-green-600">{treatment.insuranceCoverage}%</div>
            </div>
          </div>

          <div className="mt-4">
            <span className="font-medium text-gray-700">Común para:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {treatment.commonFor.map((condition, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {condition}
                </span>
              ))}
            </div>
          </div>

          {treatment.sideEffects && (
            <div className="mt-3">
              <span className="font-medium text-gray-700">Efectos Secundarios:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {treatment.sideEffects.map((effect, index) => (
                  <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {effect}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appointments':
        return <AppointmentsList />;
      case 'doctors':
        return <DoctorsDirectory />;
      case 'clinics':
        return <ClinicsDirectory />;
      case 'treatments':
        return <TreatmentsDatabase />;
      default:
        return <AppointmentsList />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Seguimiento de Atención Médica</h2>
          <p className="text-gray-600">Registra y gestiona tus citas médicas, doctores y tratamientos</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Cita</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'appointments', label: 'Mis Citas', icon: Calendar },
            { key: 'doctors', label: 'Doctores', icon: User },
            { key: 'clinics', label: 'Clínicas', icon: MapPin },
            { key: 'treatments', label: 'Tratamientos', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Add Appointment Form Modal */}
      {showAddForm && <AppointmentForm />}
    </div>
  );
};

export default MedicalCareTracking;