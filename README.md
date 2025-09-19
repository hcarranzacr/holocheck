# 🔬 **HoloCheck - Sistema Biométrico Profesional**

[![Version](https://img.shields.io/badge/version-1.1.2-blue.svg)](https://github.com/hcarranzacr/holocheck)
[![Status](https://img.shields.io/badge/status-MVP%20Funcional-green.svg)](https://github.com/hcarranzacr/holocheck)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Análisis biométrico avanzado de 36+ biomarcadores utilizando rPPG y análisis vocal en tiempo real**

---

## 🚀 **Características Principales**

### **🔍 Detección Facial Avanzada**
- Detección en tiempo real con umbrales optimizados (25%/30%)
- Análisis de calidad de señal (nitidez + iluminación)
- Estabilización automática con promedio móvil
- Compatibilidad cross-browser garantizada

### **📊 Análisis Biométrico Completo**
- **36+ Biomarcadores** procesados en tiempo real
- **8 Métricas Cardiovasculares** primarias
- **16 Métricas HRV** avanzadas  
- **12 Biomarcadores Vocales** para análisis de estrés

### **🎯 Casos de Uso**
- 🏥 **Análisis Médico Profesional**
- 💪 **Evaluación de Bienestar**
- 🔬 **Investigación Científica**
- 📈 **Monitoreo de Salud**

---

## 📋 **Requisitos del Sistema**

### **Hardware Mínimo:**
- 📹 Cámara web (640x480 mínimo, 1280x720 ideal)
- 🎤 Micrófono para análisis vocal
- 💻 Procesador moderno (recomendado i5 o equivalente)

### **Software Compatible:**
- ✅ **Chrome** (recomendado)
- ✅ **Safari** (configuración optimizada)
- ✅ **Firefox** (soporte completo)
- ✅ **Edge** (compatible)

---

## 🛠️ **Instalación y Configuración**

### **1. Clonar Repositorio**
```bash
git clone https://github.com/hcarranzacr/holocheck.git
cd holocheck
```

### **2. Instalar Dependencias**
```bash
pnpm install
# o
npm install
```

### **3. Ejecutar en Desarrollo**
```bash
pnpm run dev
# o
npm run dev
```

### **4. Construir para Producción**
```bash
pnpm run build
pnpm run preview
```

---

## 📖 **Guía de Uso**

### **Proceso de Análisis Biométrico:**

1. **🎯 Posicionamiento**
   - Centrar rostro en el círculo de detección
   - Mantener iluminación adecuada
   - Permanecer a 50-70cm de la cámara

2. **✅ Detección**
   - Esperar indicador verde "Rostro Detectado"
   - El sistema analiza calidad de señal automáticamente
   - Botón se habilita cuando detección es estable

3. **🚀 Análisis**
   - Hacer clic en "Iniciar Análisis Biométrico"
   - Permanecer inmóvil durante 30 segundos
   - Hablar normalmente para análisis vocal

4. **📊 Resultados**
   - Visualización en tiempo real de biomarcadores
   - Métricas cardiovasculares actualizadas cada segundo
   - Análisis vocal procesado continuamente

---

## 🔬 **Biomarcadores Analizados**

### **💓 Métricas Cardiovasculares Primarias (8)**
| Biomarcador | Descripción | Unidad |
|-------------|-------------|---------|
| Frecuencia Cardíaca | Latidos por minuto | BPM |
| HRV (RMSSD) | Variabilidad cardíaca | ms |
| Presión Arterial | Sistólica/Diastólica | mmHg |
| SpO₂ | Saturación de oxígeno | % |
| Frecuencia Respiratoria | Respiraciones por minuto | RPM |
| Índice de Perfusión | Flujo sanguíneo periférico | % |
| Nivel de Estrés | Evaluación cardiovascular | Bajo/Medio/Alto |
| Ritmo Cardíaco | Regularidad de latidos | Regular/Irregular |

### **📈 Métricas HRV Avanzadas (16)**
- **RMSSD, SDNN, pNN50** - Variabilidad temporal
- **Índice Triangular** - Distribución de intervalos RR
- **Potencia LF, HF, VLF** - Análisis de frecuencia
- **Ratio LF/HF** - Balance autonómico
- **Entropías** - Complejidad de la señal
- **DFA Alpha1/Alpha2** - Análisis de fluctuaciones
- **Gasto Cardíaco** - Volumen de bombeo
- **Velocidad de Onda de Pulso** - Rigidez arterial

### **🎤 Biomarcadores Vocales (12)**
- **Frecuencia Fundamental (F0)** - Tono de voz
- **Jitter/Shimmer** - Estabilidad vocal
- **Ratio Armónico-Ruido** - Calidad de voz
- **Estrés Vocal** - Tensión en la voz
- **Arousal/Valencia** - Estado emocional
- **Patrones Respiratorios** - Análisis de respiración

---

## 🏗️ **Arquitectura del Sistema**

### **Componentes Principales:**
```
src/
├── components/
│   ├── BiometricCapture.jsx      # Componente principal
│   ├── Dashboard.jsx             # Panel de control
│   └── charts/                   # Visualizaciones
├── services/
│   ├── analysis/
│   │   └── biometricProcessor.js # Motor de análisis
│   ├── rppg/
│   │   └── realTimeRPPG.js      # Procesamiento rPPG
│   └── voice/
│       └── voiceAnalysisEngine.js # Análisis vocal
└── data/
    └── mockData.js              # Datos de prueba
```

### **Flujo de Procesamiento:**
1. **Captura de Video** → MediaRecorder API
2. **Detección Facial** → Canvas + ImageData
3. **Análisis rPPG** → Procesamiento de señal
4. **Análisis Vocal** → Web Audio API
5. **Biomarcadores** → Algoritmos médicos
6. **Visualización** → React + Recharts

---

## 🔄 **Desarrollo y Contribución**

### **Política de Branches:**
- **`main`** - Versión estable en producción
- **`MejorasRPPG`** - Desarrollo activo

### **Workflow de Desarrollo:**
```bash
# 1. Trabajar en MejorasRPPG
git checkout MejorasRPPG
git pull origin MejorasRPPG

# 2. Hacer cambios y commits
git add .
git commit -m "feat: descripción del cambio"
git push origin MejorasRPPG

# 3. Merge a main (solo versiones estables)
git checkout main
git merge MejorasRPPG
git push origin main
```

### **Comandos de Desarrollo:**
```bash
pnpm run dev      # Servidor de desarrollo
pnpm run build    # Construir para producción
pnpm run lint     # Verificar código
pnpm run preview  # Previsualizar build
```

---

## 📚 **Documentación Técnica**

- 📋 **[CHANGELOG.md](CHANGELOG.md)** - Historial de cambios
- 🚀 **[RELEASE_NOTES_v1.1.2.md](RELEASE_NOTES_v1.1.2.md)** - Notas de versión
- 🔄 **[DEVELOPMENT_POLICY.md](DEVELOPMENT_POLICY.md)** - Política de desarrollo
- 🔍 **[analisis_*.md](.)** - Análisis técnicos detallados

---

## 🎯 **Roadmap**

### **v1.1.3 (Próxima)**
- [ ] Optimizaciones de precisión
- [ ] Nuevos biomarcadores
- [ ] Mejoras de UI/UX
- [ ] Exportación de reportes

### **v1.2.0 (Futuro)**
- [ ] Análisis multi-usuario
- [ ] Dashboard de tendencias
- [ ] Integración con APIs médicas
- [ ] Soporte para dispositivos IoT

---

## 🤝 **Soporte y Contacto**

### **Repositorio:**
- 🔗 **GitHub:** https://github.com/hcarranzacr/holocheck.git
- 🌿 **Branch Activo:** MejorasRPPG
- 📊 **Issues:** [GitHub Issues](https://github.com/hcarranzacr/holocheck/issues)

### **Documentación:**
- 📖 **Guías:** `/docs/`
- 🔧 **API:** `/src/services/`
- 📝 **Análisis:** `/analisis_*.md`

---

## 📄 **Licencia**

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 🏆 **Reconocimientos**

- **React** - Framework de interfaz de usuario
- **Vite** - Herramienta de construcción
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconografía
- **Recharts** - Visualización de datos

---

**🔬 HoloCheck v1.1.2 - Análisis Biométrico Profesional**  
*Desarrollado con ❤️ para el avance de la medicina digital*