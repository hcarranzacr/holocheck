# HoloCheck - Sistema de Análisis Biométrico con IA

Sistema avanzado de análisis biométrico que utiliza inteligencia artificial para proporcionar evaluaciones de salud personalizadas, análisis empresariales y evaluaciones actuariales.

## 🚀 Características Principales

- **Análisis Biométrico Multimodal**: Captura y análisis de imagen facial y voz
- **IA Integrada**: Análisis con OpenAI GPT-4 para recomendaciones personalizadas
- **3 Pilares de Análisis**:
  - 👤 **Personal**: Recomendaciones individuales de salud
  - 🏢 **Empresarial**: Análisis de conglomerados de empleados
  - 🛡️ **Aseguradoras**: Evaluación actuarial de riesgo

## 🔑 Configuración OpenAI API

### Opción 1: Variable de Entorno (Recomendado)
1. Crea un archivo `.env` en la raíz del proyecto
2. Agrega tu API key:
```bash
VITE_OPENAI_API_KEY=tu-api-key-aqui
```

### Opción 2: Configuración Manual
1. Ve a **Configuración** en la aplicación
2. Pestaña **API Keys**
3. Pega tu API key de OpenAI
4. Haz clic en **Guardar**

### Obtener API Key de OpenAI
1. Ve a [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Inicia sesión en tu cuenta de OpenAI
3. Haz clic en "Create new secret key"
4. Copia la key y configúrala usando una de las opciones anteriores

## 🛠️ Instalación y Desarrollo

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tu API key de OpenAI

# Ejecutar en desarrollo
pnpm run dev

# Construir para producción
pnpm run build

# Verificar código
pnpm run lint
```

## 📊 Arquitectura del Sistema

### Componentes Principales
- **BiometricCapture**: Captura multimodal (imagen + audio)
- **AIResponse**: Visualización de análisis de IA
- **Settings**: Configuración de prompts y API keys
- **Dashboard**: Panel principal con navegación

### Servicios
- **openaiService**: Integración con OpenAI API
- **openaiPrompts**: Gestión de prompts configurables
- **storageService**: Almacenamiento local de datos

## 🔒 Seguridad

- **API Keys Seguras**: Nunca se incluyen en el código fuente
- **Almacenamiento Local**: Las claves se guardan solo en el navegador
- **Cifrado AES-256**: Para todos los datos biométricos
- **Cumplimiento GDPR/HIPAA**: Políticas de privacidad implementadas
- **GitHub Push Protection**: Previene la exposición accidental de secretos

## 🧪 Prompts Configurables

El sistema incluye 3 prompts especializados que pueden ser editados desde la configuración:

### 👤 Prompt Personal
- Variables: `{biomarcadores}`, `{edad}`, `{genero}`, `{historialMedico}`, `{factoresRiesgo}`
- Genera recomendaciones personalizadas de salud

### 🏢 Prompt Empresarial
- Variables: `{datosEmpleados}`, `{departamento}`, `{tamanoEmpresa}`, `{industria}`, `{metricas}`
- Análisis de conglomerados y métricas organizacionales

### 🛡️ Prompt Aseguradoras
- Variables: `{perfilRiesgo}`, `{historialMedico}`, `{biomarcadores}`, `{edad}`, `{ocupacion}`
- Evaluación actuarial y análisis de riesgo

## 📈 Métricas y Análisis

- **80+ Biomarcadores**: Frecuencia cardíaca, presión arterial, estrés, etc.
- **Análisis de Voz**: Biomarcadores de estrés vocal
- **Análisis Facial**: Micro-expresiones y indicadores de salud
- **Historial Completo**: Seguimiento temporal de métricas

## 🌐 Despliegue

El proyecto está configurado para despliegue automático con:
- **GitHub Actions**: CI/CD automatizado
- **Vite**: Build optimizado para producción
- **ESLint**: Verificación de calidad de código

## 📚 Documentación Adicional

- [Configuración de Prompts](docs/prompts.md)
- [Guía de Seguridad](docs/security.md)
- [API Reference](docs/api.md)

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## ⚠️ Disclaimer

Este sistema es para fines informativos y de investigación. No reemplaza la consulta médica profesional. Siempre consulta con un profesional de la salud para decisiones médicas importantes.