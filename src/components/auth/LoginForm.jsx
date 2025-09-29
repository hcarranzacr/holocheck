import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { USER_ROLES } from '../../services/supabase/authService';

const LoginForm = ({ onClose }) => {
  const { signIn, signUp, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    pillarType: USER_ROLES.INDIVIDUAL,
    companyName: '',
    hipaaConsent: false,
    dataRetentionConsent: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email y contraseña son requeridos');
      return false;
    }

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }

      if (formData.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return false;
      }

      if (!formData.fullName) {
        setError('El nombre completo es requerido');
        return false;
      }

      if (!formData.hipaaConsent) {
        setError('Debe aceptar el consentimiento HIPAA para continuar');
        return false;
      }

      if (formData.pillarType === USER_ROLES.COMPANY && !formData.companyName) {
        setError('El nombre de la empresa es requerido');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const { data, error } = await signUp(formData.email, formData.password, {
          fullName: formData.fullName,
          pillarType: formData.pillarType,
          companyName: formData.companyName,
          hipaaConsent: formData.hipaaConsent,
          dataRetentionConsent: formData.dataRetentionConsent
        });

        if (error) {
          setError(error.message);
        } else {
          setSuccess('Cuenta creada exitosamente. Revisa tu email para confirmar tu cuenta.');
          setTimeout(() => {
            setIsSignUp(false);
            setSuccess('');
          }, 3000);
        }
      } else {
        const { data, error } = await signIn(formData.email, formData.password);

        if (error) {
          setError(error.message);
        } else {
          setSuccess('Inicio de sesión exitoso');
          setTimeout(() => {
            onClose?.();
          }, 1000);
        }
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.');
      console.error('Auth error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {isSignUp && (
            <>
              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Pillar Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Usuario
                </label>
                <select
                  name="pillarType"
                  value={formData.pillarType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={USER_ROLES.INDIVIDUAL}>Individual</option>
                  <option value={USER_ROLES.COMPANY}>Empresa</option>
                  <option value={USER_ROLES.INSURANCE}>Aseguradora</option>
                </select>
              </div>

              {/* Company Name (if company pillar) */}
              {formData.pillarType === USER_ROLES.COMPANY && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {/* HIPAA Consent */}
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="hipaaConsent"
                    checked={formData.hipaaConsent}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    Acepto el <strong>Consentimiento HIPAA</strong> para el manejo de mi información de salud protegida (PHI).
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="dataRetentionConsent"
                    checked={formData.dataRetentionConsent}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Acepto las <strong>Políticas de Retención de Datos</strong> (7 años para cumplimiento HIPAA).
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>

          {/* Toggle Sign Up/Sign In */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isSignUp 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate'
              }
            </button>
          </div>
        </form>

        {/* HIPAA Compliance Notice */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            🔒 <strong>Cumplimiento HIPAA:</strong> Todos los datos biométricos son encriptados con AES-256 
            y almacenados de forma segura. Solo tú puedes acceder a tu información de salud personal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;