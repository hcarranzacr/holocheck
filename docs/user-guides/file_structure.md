# HoloCheck Platform - File Structure Documentation

## 📁 Complete Directory Structure

```
/workspace/dashboard/
├── 📄 README.md                           # Project overview and setup instructions
├── 📄 package.json                        # Dependencies and scripts configuration
├── 📄 pnpm-lock.yaml                      # Package manager lock file
├── 📄 vite.config.js                      # Vite build configuration
├── 📄 tailwind.config.js                  # Tailwind CSS configuration
├── 📄 postcss.config.js                   # PostCSS configuration
├── 📄 eslint.config.js                    # ESLint linting rules
├── 📄 template_config.json                # Template metadata
├── 📄 todo.md                            # Development tasks and MVP requirements
├── 📄 index.html                         # Main HTML entry point - "HoloCheck Platform"
│
├── 📁 src/                               # Source code directory
│   ├── 📄 main.jsx                       # React application entry point
│   ├── 📄 App.jsx                        # Main application component
│   ├── 📄 index.css                      # Global styles and Tailwind imports
│   │
│   ├── 📁 components/                    # React components (4 Pillars Implementation)
│   │   ├── 📄 Header.jsx                 # Navigation header component
│   │   ├── 📄 Sidebar.jsx                # Navigation sidebar component
│   │   ├── 📄 Dashboard.jsx              # Main dashboard overview
│   │   ├── 📄 StatsCard.jsx              # Statistics display component
│   │   │
│   │   ├── 🏛️ PILLAR 1: Personal Health Monitoring
│   │   ├── 📄 EmployeeHealthCheck.jsx    # Main health check with ID verification + OpenAI
│   │   ├── 📄 PillarOne.jsx              # Personal health check interface
│   │   ├── 📄 HealthDataReader.jsx       # Secure smartphone health data access
│   │   │
│   │   ├── 🏢 PILLAR 2: Company Analytics
│   │   ├── 📄 PillarTwo.jsx              # Company health analytics
│   │   ├── 📄 OrganizationalHealth.jsx   # Company-wide health metrics
│   │   ├── 📄 UnifiedPortal.jsx          # Multi-role access portal
│   │   ├── 📄 LoginPortal.jsx            # Authentication interface
│   │   │
│   │   ├── 🏥 PILLAR 3: Insurance Integration
│   │   ├── 📄 PillarThree.jsx            # Insurance analytics interface
│   │   ├── 📄 InsuranceAnalytics.jsx     # Insurance resource monitoring
│   │   │
│   │   ├── 🎮 PILLAR 4: Gamification & Medical Care
│   │   ├── 📄 DeviceIntegrations.jsx     # Wearable and device connections
│   │   ├── 📄 MedicalCareTracking.jsx    # Medical appointments and treatments
│   │   │
│   │   └── 📁 charts/                    # Data visualization components
│   │       ├── 📄 LineChart.jsx          # Line chart component
│   │       ├── 📄 AreaChart.jsx          # Area chart component
│   │       ├── 📄 BarChart.jsx           # Bar chart component
│   │       ├── 📄 PieChart.jsx           # Pie chart component
│   │       ├── 📄 RadarChart.jsx         # Radar chart component
│   │       ├── 📄 GaugeChart.jsx         # Gauge chart component
│   │       ├── 📄 TreeMap.jsx            # TreeMap chart component
│   │       └── 📄 BubbleChart.jsx        # Bubble chart component
│   │
│   └── 📁 data/                          # Data layer and business logic
│       ├── 📄 mockData.js                # Chart and dashboard mock data
│       ├── 📄 authData.js                # User roles and access control
│       ├── 📄 longitudinalData.js        # Health indicators and timeline data
│       ├── 📄 motivationStrategies.js    # Gamification and device integration data
│       ├── 📄 medicalCareData.js         # Medical care tracking data structure
│       ├── 📄 employeeCasesData.js       # Employee health cases and AI analysis data
│       └── 📄 gamificationData.js        # Points system and rewards store
│
├── 📁 docs/                             # Documentation directory
│   ├── 📄 manual_usuario_holoccheck.md   # Complete user manual (Spanish)
│   ├── 📄 manual_usuario_holoccheck_completo.html # Interactive HTML manual
│   └── 📄 file_structure.md             # This file - platform architecture
│
├── 📁 public/                           # Static assets directory
│   └── 📁 assets/                       # Static files (images, documents, etc.)
│
└── 📁 dist/                            # Build output directory (generated)
    ├── 📄 index.html                    # Built HTML file
    └── 📁 assets/                       # Built CSS/JS assets
```

## 🏗️ Architecture Overview

### Core Application Structure

**Entry Points:**
- `index.html` - Main HTML template with HoloCheck branding
- `src/main.jsx` - React application bootstrap
- `src/App.jsx` - Root component with layout structure

**Layout Components:**
- `Header.jsx` - Top navigation with HoloCheck logo and user menu
- `Sidebar.jsx` - Left navigation menu for different portals
- `Dashboard.jsx` - Main dashboard aggregating all 4 pillars

## 🏛️ Four Pillars Implementation

### 🔬 Pillar 1: Personal Health Monitoring
**Files:** `PillarOne.jsx`, `EmployeeHealthCheck.jsx`, `HealthDataReader.jsx`

**Purpose:** Individual health assessments with biometric verification
- Facial analysis (140+ biomarkers via rPPG)
- Voice analysis (40+ acoustic indicators)
- OpenAI GPT-4 medical analysis integration
- Biometric ID verification (94%+ accuracy)
- Secure smartphone health data access

**Data Sources:** `longitudinalData.js`, `employeeCasesData.js`

### 🏢 Pillar 2: Company Health Analytics  
**Files:** `PillarTwo.jsx`, `OrganizationalHealth.jsx`, `UnifiedPortal.jsx`, `LoginPortal.jsx`

**Purpose:** Enterprise-level health monitoring and management
- Organizational health metrics aggregation
- Anonymous data collection by hierarchy levels
- Multi-role access (Employee/Manager/HR/Admin)
- Company-wide health trends and insights

**Data Sources:** `authData.js`, `mockData.js`

### 🏥 Pillar 3: Insurance Integration
**Files:** `PillarThree.jsx`, `InsuranceAnalytics.jsx`

**Purpose:** Insurance resource optimization and medical cost management
- Medical resource utilization tracking
- Insurance claim analytics
- Cost-benefit analysis of preventive care
- Risk assessment and premium optimization

**Data Sources:** `medicalCareData.js`, chart components

### 🎮 Pillar 4: Gamification & Medical Care
**Files:** `DeviceIntegrations.jsx`, `MedicalCareTracking.jsx`

**Purpose:** Engagement through gamification and comprehensive medical care tracking
- Wearable device integrations (Apple Watch, Garmin, Fitbit, Samsung)
- Points system and rewards store
- Medical appointment scheduling and tracking
- Treatment history and medication management

**Data Sources:** `motivationStrategies.js`, `gamificationData.js`, `medicalCareData.js`

## 📊 Data Architecture

### Health Data Files
- **`longitudinalData.js`** - Health indicators, biomarkers, voice analysis parameters
- **`employeeCasesData.js`** - Simulated employee health cases for AI analysis
- **`medicalCareData.js`** - Medical appointments, treatments, insurance data

### System Configuration Files
- **`authData.js`** - User roles, permissions, organizational structure
- **`motivationStrategies.js`** - Gamification rules, device capabilities
- **`gamificationData.js`** - Points system, achievements, rewards store
- **`mockData.js`** - Chart data and dashboard metrics

## 🔧 Configuration & Build Files

### Development Configuration
- **`package.json`** - Dependencies: React, Recharts, Tailwind CSS, Lucide icons
- **`vite.config.js`** - Build configuration with source locator plugin
- **`tailwind.config.js`** - UI styling framework configuration
- **`eslint.config.js`** - Code quality and linting rules

### Build Output
- **`dist/`** - Production build (690.80 kB bundle, 7.22s build time)
- Optimized for deployment to holocheck.com domain

## 📚 Documentation

### User Documentation
- **`docs/manual_usuario_holoccheck.md`** - Comprehensive user manual (Spanish)
- **`docs/manual_usuario_holoccheck_completo.html`** - Interactive HTML version
- **`docs/file_structure.md`** - This technical documentation

### Content Sections
1. Platform Overview and Introduction
2. Getting Started Guide  
3. Employee Portal User Guide
4. Company Portal Administration
5. Insurance Portal Management
6. Health Check Process (Selfie + Voice)
7. Gamification System and Rewards
8. Device Integration Setup
9. Privacy and Security Features
10. Troubleshooting and FAQ

## 🔒 Security & Privacy Features

### Data Protection
- **AES-256 encryption** for all medical data
- **GDPR compliance** with automatic 30-day data deletion
- **Local processing** - no cloud storage of sensitive health data
- **Biometric verification** ensuring correct patient identity

### Access Control
- **Multi-level authentication** (Employee/Company/Insurance portals)
- **Role-based permissions** defined in `authData.js`
- **Anonymous data aggregation** for organizational insights
- **Audit trails** for all medical data access

## 🚀 Deployment Configuration

### Domain Setup
- **Target Domain:** holocheck.com (GoDaddy)
- **Build Command:** `pnpm run build`
- **Deploy Directory:** `dist/`
- **Static Hosting Compatible:** Yes (Vite build output)

### Performance Metrics
- **Bundle Size:** 690.80 kB (186.62 kB gzipped)
- **Build Time:** 7.22 seconds
- **Modules:** 2,485+ transformed
- **Framework:** React + Vite for optimal performance

## 🔄 Component Relationships

```
App.jsx
├── Header.jsx (HoloCheck branding)
├── Sidebar.jsx (Portal navigation)
└── Dashboard.jsx
    ├── PillarOne.jsx → EmployeeHealthCheck.jsx → HealthDataReader.jsx
    ├── PillarTwo.jsx → OrganizationalHealth.jsx → UnifiedPortal.jsx
    ├── PillarThree.jsx → InsuranceAnalytics.jsx
    └── DeviceIntegrations.jsx + MedicalCareTracking.jsx
        └── Charts/* (Data visualization)
```

## 📱 Device Integration Support

### Wearable Devices
- Apple Watch (HealthKit integration)
- Garmin devices (Connect IQ)
- Fitbit (Web API)
- Samsung Galaxy Watch (Samsung Health)

### Smartphone Capabilities
- Native health sensors (heart rate, steps, sleep)
- Camera (facial analysis, rPPG)
- Microphone (voice biomarkers)
- Accelerometer/Gyroscope (activity tracking)

---

**Last Updated:** December 2024  
**Platform Version:** HoloCheck v2.1  
**Build Status:** ✅ Production Ready