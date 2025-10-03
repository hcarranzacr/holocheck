# Architecture Documentation

System architecture and design documents for HoloCheck.

## Files

- `arquitectura-4-pilares-usuarios.md` - 4-pillar user architecture specification
- `system_design_4_pillars.md` - Complete system design for multi-tenant architecture
- `DEVELOPMENT_POLICY.md` - Development policies and standards

## Architecture Overview

HoloCheck implements a 4-pillar multi-tenant architecture:
1. End Users (Patients/Families)
2. Company Administrators (HR/Wellness Teams)
3. Insurance Administrators (Risk Assessment Teams)
4. Platform Administrators (System Management)

Each pillar has isolated data access and specialized interfaces.