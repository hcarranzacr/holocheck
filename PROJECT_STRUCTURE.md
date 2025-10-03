# HoloCheck Project Structure

## Directory Organization

```
/workspace/dashboard/
├── README.md                    # Main project documentation
├── VERSION.txt                  # Current version (1.4.0)
├── package.json                 # Node.js dependencies and scripts
├── vite.config.js              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── eslint.config.js            # ESLint configuration
├── postcss.config.js           # PostCSS configuration
├── index.html                  # Main HTML entry point
│
├── src/                        # Source code
│   ├── App.jsx                 # Main React application
│   ├── main.jsx                # Application entry point
│   ├── index.css               # Global styles
│   ├── components/             # React components
│   ├── services/               # Business logic and API services
│   ├── hooks/                  # Custom React hooks
│   ├── data/                   # Mock data and constants
│   └── utils/                  # Utility functions
│
├── docs/                       # Documentation (organized by category)
│   ├── README.md               # Documentation index
│   ├── api/                    # API documentation
│   ├── architecture/           # System architecture and design
│   ├── deployment/             # Deployment and release documentation
│   ├── medical/                # Medical studies and biomarker specs
│   ├── security/               # Security policies and HIPAA compliance
│   └── user-guides/            # User manuals for each pillar
│
├── scripts/                    # Automation scripts
│   ├── README.md               # Scripts documentation
│   ├── database/               # Database migration and setup scripts
│   ├── deployment/             # Deployment automation
│   ├── maintenance/            # System maintenance scripts
│   └── setup/                  # Initial setup and configuration
│
├── archive/                    # Archived files
│   ├── README.md               # Archive documentation
│   ├── legacy-docs/            # Old documentation and analysis
│   ├── old-analysis/           # Historical analysis files
│   └── deprecated/             # Deprecated code and configs
│
├── tests/                      # Test files (future implementation)
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
│
└── public/                     # Static assets
    ├── images/                 # Image assets
    └── docs/                   # Public documentation files
```

## File Naming Conventions

- **kebab-case** for all file names
- **PascalCase** for React components
- **camelCase** for JavaScript variables and functions
- Version numbers in format: `v1.4.0`
- Categories prefix: `category-description-version.extension`

## Documentation Standards

- Each directory contains a `README.md` file
- Documentation is organized by category and purpose
- Version numbers are included where applicable
- All documentation is kept up-to-date with code changes

## Architecture Overview

HoloCheck implements a **4-Pillar Multi-Tenant Architecture**:

1. **End Users** - Patients and family members
2. **Company Administrators** - HR and wellness teams  
3. **Insurance Administrators** - Risk assessment teams
4. **Platform Administrators** - System management

Each pillar has:
- Isolated data access with Row Level Security (RLS)
- Specialized user interfaces
- Role-based permissions
- Tenant-specific configurations