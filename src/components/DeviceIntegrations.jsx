import React, { useState } from 'react';
import { Smartphone, Watch, Headphones, Activity, Heart, Wifi, Bluetooth, Shield, CheckCircle, AlertTriangle, Plus, Settings } from 'lucide-react';
import { deviceIntegrations, wearableDevices, smartphoneCapabilities } from '../data/motivationStrategies';
import HealthDataReader from './HealthDataReader';

const DeviceIntegrations = () => {
  const [activeTab, setActiveTab] = useState('smartphone');
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [healthDataEnabled, setHealthDataEnabled] = useState(false);
  const [showHealthReader, setShowHealthReader] = useState(false);

  const handleDeviceConnection = (deviceId) => {
    if (connectedDevices.includes(deviceId)) {
      setConnectedDevices(connectedDevices.filter(id => id !== deviceId));
    } else {
      setConnectedDevices([...connectedDevices, deviceId]);
    }
  };

  const handleHealthDataReceived = (data) => {
    setHealthDataEnabled(true);
    console.log('Health data received:', data);
    // Here you would typically send this data to your health analysis system
  };

  const SmartphoneIntegration = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <Smartphone className="w-8 h-8 mr-3" />
          <div>
            <h3 className="text-xl font-bold">Integración con Smartphone</h3>
            <p className="text-blue-100">Accede a datos de salud directamente desde tu teléfono</p>
          </div>
        </div>
      </div>

      {/* Health Data Reader Component */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Datos de Salud del Dispositivo</h4>
          <button
            onClick={() => setShowHealthReader(!showHealthReader)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showHealthReader ? 'Ocultar' : 'Configurar'} Acceso
          </button>
        </div>
        
        {showHealthReader && (
          <HealthDataReader onDataReceived={handleHealthDataReceived} />
        )}
        
        {healthDataEnabled && (
          <div className="mt-4 p-4 bg-green-100 rounded-lg">
            <div className="flex items-center text-green-800">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-semibold">Datos de salud configurados correctamente</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Los datos se están procesando de forma segura y privada en tu dispositivo
            </p>
          </div>
        )}
      </div>

      {/* Smartphone Capabilities */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Capacidades del Smartphone</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {smartphoneCapabilities.sensors.map((sensor, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">{sensor.name}</div>
                <div className="text-sm text-gray-600">{sensor.description}</div>
                <div className="text-xs text-blue-600">Precisión: {sensor.accuracy}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Apps Integration */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Integración con Apps de Salud</h4>
        <div className="grid md:grid-cols-3 gap-4">
          {smartphoneCapabilities.healthApps.map((app, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">{app.name.charAt(0)}</span>
                </div>
                <div className="font-semibold text-gray-800">{app.name}</div>
              </div>
              <div className="space-y-2">
                {app.metrics.map((metric, idx) => (
                  <div key={idx} className="text-sm text-gray-600 flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                    {metric}
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleDeviceConnection(`app_${index}`)}
                className={`w-full mt-3 px-3 py-2 rounded text-sm font-medium ${
                  connectedDevices.includes(`app_${index}`)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {connectedDevices.includes(`app_${index}`) ? 'Conectado' : 'Conectar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const WearableIntegration = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <Watch className="w-8 h-8 mr-3" />
          <div>
            <h3 className="text-xl font-bold">Dispositivos Wearables</h3>
            <p className="text-green-100">Conecta smartwatches y dispositivos de fitness</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {wearableDevices.map((device, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                <Watch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{device.name}</h4>
                <p className="text-sm text-gray-600">{device.brand}</p>
              </div>
              <div className="ml-auto">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  device.compatibility === 'high' ? 'bg-green-100 text-green-800' :
                  device.compatibility === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {device.compatibility === 'high' ? 'Alta' :
                   device.compatibility === 'medium' ? 'Media' : 'Baja'} Compatibilidad
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <h5 className="font-medium text-gray-700">Métricas Disponibles:</h5>
              <div className="grid grid-cols-2 gap-2">
                {device.metrics.map((metric, idx) => (
                  <div key={idx} className="text-sm text-gray-600 flex items-center">
                    <Heart className="w-3 h-3 text-red-500 mr-1" />
                    {metric}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duración de Batería:</span>
                <span className="font-medium">{device.batteryLife}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Resistencia al Agua:</span>
                <span className="font-medium">{device.waterResistance}</span>
              </div>
            </div>

            <button
              onClick={() => handleDeviceConnection(`wearable_${index}`)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                connectedDevices.includes(`wearable_${index}`)
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {connectedDevices.includes(`wearable_${index}`) ? (
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Conectado
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Bluetooth className="w-4 h-4 mr-2" />
                  Conectar
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const AudioIntegration = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <Headphones className="w-8 h-8 mr-3" />
          <div>
            <h3 className="text-xl font-bold">Dispositivos de Audio</h3>
            <p className="text-purple-100">Auriculares inteligentes y análisis de voz</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {deviceIntegrations.audioDevices.map((device, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-4">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{device.name}</h4>
                <p className="text-sm text-gray-600">{device.type}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <h5 className="font-medium text-gray-700">Capacidades de Salud:</h5>
              <div className="space-y-2">
                {device.healthFeatures.map((feature, idx) => (
                  <div key={idx} className="text-sm text-gray-600 flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conectividad:</span>
                <span className="font-medium">{device.connectivity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Autonomía:</span>
                <span className="font-medium">{device.batteryLife}</span>
              </div>
            </div>

            <button
              onClick={() => handleDeviceConnection(`audio_${index}`)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                connectedDevices.includes(`audio_${index}`)
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {connectedDevices.includes(`audio_${index}`) ? (
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Conectado
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Bluetooth className="w-4 h-4 mr-2" />
                  Conectar
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const ConnectedDevicesStatus = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Dispositivos Conectados</h3>
      
      {connectedDevices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Wifi className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No hay dispositivos conectados</p>
          <p className="text-sm">Conecta dispositivos para mejorar el análisis de salud</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <div className="font-semibold text-green-800">
                  {connectedDevices.length} dispositivo(s) conectado(s)
                </div>
                <div className="text-sm text-green-600">
                  Datos sincronizándose en tiempo real
                </div>
              </div>
            </div>
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {connectedDevices.map((deviceId, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Dispositivo {deviceId}
                  </span>
                </div>
                <button
                  onClick={() => handleDeviceConnection(deviceId)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Desconectar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Integraciones de Dispositivos</h2>
          <p className="text-gray-600">Conecta dispositivos para un análisis de salud más completo</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'smartphone', label: 'Smartphone', icon: Smartphone },
            { key: 'wearables', label: 'Wearables', icon: Watch },
            { key: 'audio', label: 'Audio', icon: Headphones },
            { key: 'status', label: 'Estado', icon: Settings }
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
      {activeTab === 'smartphone' && <SmartphoneIntegration />}
      {activeTab === 'wearables' && <WearableIntegration />}
      {activeTab === 'audio' && <AudioIntegration />}
      {activeTab === 'status' && <ConnectedDevicesStatus />}
    </div>
  );
};

export default DeviceIntegrations;