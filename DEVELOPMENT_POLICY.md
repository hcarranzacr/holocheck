# 📋 **POLÍTICA DE DESARROLLO - HoloCheck**

## 🔄 **Workflow de Branches**

### **Branch Principal: `main`**
- ✅ **Propósito:** Versiones estables y funcionales
- ✅ **Contenido:** Solo código probado y validado
- ✅ **Actualizaciones:** Solo mediante merge desde MejorasRPPG

### **Branch de Desarrollo: `MejorasRPPG`**
- 🚀 **Propósito:** Desarrollo activo y mejoras continuas
- 🚀 **Contenido:** Nuevas funcionalidades, correcciones, optimizaciones
- 🚀 **Actualizaciones:** Desarrollo directo y commits frecuentes

## 📝 **Proceso de Desarrollo**

### **1. Desarrollo de Nuevas Funcionalidades:**
```bash
# Trabajar siempre en MejorasRPPG
git checkout MejorasRPPG
git pull origin MejorasRPPG

# Desarrollar y commitear cambios
git add .
git commit -m "feat: descripción de la mejora"
git push origin MejorasRPPG
```

### **2. Merge a Main (Solo Versiones Estables):**
```bash
# Cuando la funcionalidad esté completamente probada
git checkout main
git pull origin main
git merge MejorasRPPG
git push origin main

# Regresar a desarrollo
git checkout MejorasRPPG
```

## 🎯 **Reglas de Desarrollo**

### **✅ PERMITIDO:**
- Desarrollo directo en `MejorasRPPG`
- Commits frecuentes en `MejorasRPPG`
- Experimentación y pruebas en `MejorasRPPG`
- Push directo a `MejorasRPPG`

### **❌ PROHIBIDO:**
- Commits directos a `main`
- Push directo a `main`
- Desarrollo en `main`
- Merge sin validación previa

## 📊 **Tipos de Commits**

### **Formato Estándar:**
```
tipo: descripción breve

Tipos válidos:
- feat: nueva funcionalidad
- fix: corrección de bugs
- docs: documentación
- style: formato, espacios
- refactor: refactorización
- test: pruebas
- chore: mantenimiento
```

### **Ejemplos:**
```bash
git commit -m "feat: implementar análisis de biomarcadores vocales"
git commit -m "fix: corregir umbral de detección facial"
git commit -m "docs: actualizar documentación de API"
```

## 🔍 **Validación Antes de Merge**

### **Checklist Obligatorio:**
- [ ] ✅ Funcionalidad completamente implementada
- [ ] ✅ Pruebas realizadas en múltiples navegadores
- [ ] ✅ Sin errores en `pnpm run lint`
- [ ] ✅ Sin errores en `pnpm run build`
- [ ] ✅ Documentación actualizada
- [ ] ✅ Commits con mensajes descriptivos

## 🚀 **Estado Actual del Proyecto**

### **Versión en Main:**
- Sistema biométrico completamente funcional
- Detección facial optimizada (umbrales 25%/30%)
- Grabación de video/audio operativa
- Análisis de 36+ biomarcadores
- Compatibilidad Safari/Chrome

### **Próximas Mejoras en MejorasRPPG:**
- Optimizaciones de rendimiento
- Nuevos biomarcadores
- Mejoras de UI/UX
- Integración con APIs externas

---

**📅 Última Actualización:** 2025-09-19  
**👥 Responsable:** Equipo HoloCheck  
**🔗 Repositorio:** https://github.com/hcarranzacr/holocheck.git