# HoloCheck Documentation Master Index

## 📚 **DOCUMENTATION HIERARCHY & NAVIGATION GUIDE**

### **🎯 START HERE - Essential Reading Order**

**For New Developers:**
1. `/README.md` - Project overview and quick start
2. `/docs/architecture/system_design_4_pillars.md` - Core architecture
3. `/docs/user-guides/MANUAL_USUARIO_4_PILARES.md` - User manual
4. `/docs/security/SEGURIDAD_HIPAA.md` - Security compliance

**For System Administrators:**
1. `/scripts/database/README.md` - Database setup guide
2. `/scripts/setup/README.md` - User creation scripts
3. `/docs/deployment/RELEASE_NOTES_v1.4.0.md` - Current version info

---

## 📁 **CURRENT ACTIVE DOCUMENTATION**

### **Architecture & Design (CURRENT)**
- `docs/architecture/system_design_4_pillars.md` - **MASTER DESIGN** ✅
- `docs/architecture/arquitectura-4-pilares-usuarios.md` - User architecture
- `docs/architecture/HoloCheck_Supabase_Architecture.md` - Database architecture
- `docs/architecture/holocheck_multitenant_architecture.md` - Multi-tenant design

### **Product Requirements (ACTIVE)**
- `docs/architecture/PRD_HoloCheck_Anuralogix_Interface.md` - Anuralogix integration
- `docs/architecture/PRD_Mejora_Guia_Posicionamiento_Facial.md` - Facial positioning
- `docs/architecture/PRD_Mejora_Indicadores_Biometricos_Tiempo_Real.md` - Real-time metrics

### **Database & Scripts (PRODUCTION)**
- `scripts/database/05-four-pillars-redesign.sql` - **CURRENT SCHEMA** ✅
- `scripts/database/HoloCheck_Supabase_SQL_Scripts.sql` - Base setup
- `scripts/setup/create-four-pillar-users.js` - User creation

### **User Documentation (CURRENT)**
- `docs/user-guides/MANUAL_USUARIO_4_PILARES.md` - **MASTER MANUAL** ✅
- `docs/user-guides/ACCESO_SISTEMA.md` - Access guide
- `docs/user-guides/USUARIOS_SISTEMA.md` - User credentials

---

## 🗂️ **ARCHIVED DOCUMENTATION**

### **Legacy Analysis (HISTORICAL)**
- `archive/old-analysis/analisis_biomarcadores_holocheck.md` - Old biomarker analysis
- `archive/old-analysis/analisis_detallado_holocheck_biomarcadores.md` - Detailed analysis
- `archive/old-analysis/mejoras_detalladas_holocheck.md` - Old improvements

### **Legacy Documentation (REFERENCE ONLY)**
- `archive/legacy-docs/CRITICAL_FIX_AUTO_RECORDING.md` - Old critical fixes
- `archive/legacy-docs/HOLOCCHECK_ROADMAP_*.md` - Old roadmaps
- `archive/legacy-docs/biometric_system_documentation_framework_v1.md` - Old framework

---

## 🔄 **DOCUMENT RELATIONSHIPS**

### **Primary Dependencies**
```
README.md
├── docs/architecture/system_design_4_pillars.md (MASTER)
├── docs/user-guides/MANUAL_USUARIO_4_PILARES.md (MANUAL)
└── scripts/database/05-four-pillars-redesign.sql (SCHEMA)
```

### **Implementation Flow**
1. **Architecture** → `docs/architecture/system_design_4_pillars.md`
2. **Database** → `scripts/database/05-four-pillars-redesign.sql`
3. **Users** → `scripts/setup/create-four-pillar-users.js`
4. **Manual** → `docs/user-guides/MANUAL_USUARIO_4_PILARES.md`

---

## ⚡ **QUICK REFERENCE**

### **Current Version: 1.4.0**
- **Release Notes:** `docs/deployment/RELEASE_NOTES_v1.4.0.md`
- **Architecture:** 4-Pillar Multi-Tenant System
- **Database:** 15 tables with RLS policies
- **Users:** 4 pillar types (Individual, Company, Insurance, Admin)

### **Key URLs**
- **Application:** http://localhost:3001/
- **GitHub Branch:** MejorasV1
- **Documentation:** This file serves as master index

### **Emergency Contacts**
- **Architecture Questions:** See `docs/architecture/README.md`
- **Database Issues:** See `scripts/database/README.md`
- **User Problems:** See `docs/user-guides/README.md`

---

## 📋 **DOCUMENT STATUS LEGEND**
- ✅ **CURRENT** - Active, up-to-date documentation
- 📚 **REFERENCE** - Historical, kept for reference
- ❌ **OBSOLETE** - Archived, no longer applicable
- 🔄 **UPDATING** - Currently being revised

**Last Updated:** October 3, 2025 - Version 1.4.0
**Next Review:** When version 1.5.0 is released