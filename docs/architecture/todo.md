# Digital Health Check Platform - MVP Todo

## Overview
Create a Digital Health Check Platform based on the three pillars from the preventive health document:

### Three Pillars Implementation:
1. **Pilar 1 (Asegurado)**: Personal health check via selfie (rPPG + facial analysis) and voice analysis
2. **Pilar 2 (Empresa)**: Anonymous aggregated occupational health analytics  
3. **Pilar 3 (Aseguradora)**: Open data integration with biosignals for actuarial models

## Files to Create/Modify:
1. **index.html** - Update title to "Digital Health Check Platform"
2. **src/App.jsx** - Main app structure with three pillar navigation
3. **src/components/Dashboard.jsx** - Main dashboard with pillar overview
4. **src/components/Header.jsx** - Update header for health platform
5. **src/components/Sidebar.jsx** - Navigation for three pillars
6. **src/components/PillarOne.jsx** - Personal health check (selfie + voice analysis)
7. **src/components/PillarTwo.jsx** - Company occupational health dashboard
8. **src/components/PillarThree.jsx** - Insurance actuarial analytics
9. **src/data/healthData.js** - Mock health data for all three pillars

## Key Features:
- Selfie-based health markers (HR, HRV, stress, metabolic risk)
- Voice analysis for mental health and respiratory indicators
- Company wellness analytics (anonymous aggregated data)
- Insurance risk modeling with epidemiological data
- AI-powered recommendations and preventive actions
- FHIR-ready digital health records
- Privacy-focused design with anonymization

## Technology Integration:
- Simulated OpenAI integration for facial and voice analysis
- Mock rPPG (remote photoplethysmography) for vital signs
- Preventive action recommendations
- Risk stratification and early detection alerts