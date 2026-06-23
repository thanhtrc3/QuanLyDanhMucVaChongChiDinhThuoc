Full System Design Description: Frontend, Backend, and API

Design a complete desktop-based medication management system named QLThuoc Hayday. The system includes a frontend desktop interface, backend business logic, RESTful APIs, authentication, role-based access control, database management, contraindication checking, drug interaction detection, inventory monitoring, prescription management, and audit logging.

The application is designed for three main user roles:

Admin
Doctor
Pharmacist

The main goal of the system is to help clinics and pharmacies manage medicines, patients, prescriptions, drug safety warnings, inventory, and system activities.

1. Frontend Design

The frontend should be a modern desktop application interface with a clean medical style.

Main Frontend Screens

Design the following screens:

Login Screen
Dashboard
Medicine Catalog
Add / Edit Medicine
Patient Management
Patient Detail
Prescription List
Create Prescription
Contraindication Rules
Drug Interaction Rules
Inventory Management
User Management
Audit Logs
Warning and Override Modal
Settings
Frontend Layout

Use a desktop-first layout with:

Fixed left sidebar
Top header
Main content area
Data tables
Filter bars
Search input
Status badges
Alert cards
Modal dialogs
Multi-step prescription form
Frontend Features

The frontend should support:

User login
Role-based navigation
Medicine search and filtering
Patient profile management
Prescription creation
Real-time contraindication checking
Real-time drug interaction checking
Low stock and expired medicine warnings
Override warning with required reason
Audit log viewing
Admin user management
UI Style

Use a professional healthcare design style:

Primary color: medical blue or teal
Secondary color: green
Warning color: orange
Danger color: red
Background: light gray or white
Rounded cards and inputs
Clear typography
High contrast alerts for patient safety
2. Backend Design

The backend should handle authentication, authorization, business rules, database access, validation, and API responses.

Backend Modules

Create the backend with the following modules:

Authentication Module

Responsible for:

User login
Password hash verification
JWT token generation
User session validation
Role-based access control
User Management Module

Responsible for:

Creating users
Updating users
Locking and unlocking accounts
Managing user roles
Validating username uniqueness
Medicine Management Module

Responsible for:

Adding medicines
Updating medicine information
Soft deleting medicines
Checking stock level
Checking expiry date
Searching by ATC code, trade name, or active ingredient
Patient Management Module

Responsible for:

Creating patient records
Updating patient information
Storing medical history and allergies
Checking pregnancy status
Calculating patient age from date of birth
Prescription Module

Responsible for:

Creating prescriptions
Adding prescription details
Calculating total daily dose
Checking medicine availability
Checking contraindications
Checking drug interactions
Preventing unsafe prescriptions unless overridden
Contraindication Module

Responsible for:

Managing contraindication rules
Checking patient-specific risk factors
Comparing patient data with rule conditions
Returning risk level and clinical consequence
Drug Interaction Module

Responsible for:

Managing drug interaction rules
Checking interaction between selected medicines
Returning interaction severity, mechanism, and recommended action
Inventory Module

Responsible for:

Monitoring current stock
Detecting low stock medicines
Detecting expired medicines
Detecting near-expiry medicines
Updating stock after prescription completion
Audit Log Module

Responsible for:

Recording insert, update, delete, and override actions
Saving old value and new value
Saving override reason
Tracking which user performed each action
3. RESTful API Design

The backend should expose RESTful APIs for the frontend.

Authentication APIs
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
Login Request
{
  "tenDangNhap": "doctor01",
  "matKhau": "password123"
}
Login Response
{
  "token": "jwt_token_here",
  "user": {
    "userID": 1,
    "hoTen": "Nguyen Van A",
    "vaiTro": "Bac si",
    "trangThai": true
  }
}
User APIs
GET    /api/users
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
PATCH  /api/users/{id}/lock
PATCH  /api/users/{id}/unlock
DELETE /api/users/{id}

Used by Admin to manage system users.

Patient APIs
GET    /api/patients
GET    /api/patients/{id}
POST   /api/patients
PUT    /api/patients/{id}
DELETE /api/patients/{id}
GET    /api/patients/{id}/prescriptions

Used to manage patient profiles, medical history, allergies, weight, date of birth, and pregnancy status.

Medicine APIs
GET    /api/medicines
GET    /api/medicines/{id}
POST   /api/medicines
PUT    /api/medicines/{id}
DELETE /api/medicines/{id}
GET    /api/medicines/search
GET    /api/medicines/low-stock
GET    /api/medicines/expired
GET    /api/medicines/near-expiry

Used to manage the medicine catalog and inventory status.

Contraindication APIs
GET    /api/contraindications
GET    /api/contraindications/{id}
POST   /api/contraindications
PUT    /api/contraindications/{id}
DELETE /api/contraindications/{id}
POST   /api/contraindications/check
Contraindication Check Request
{
  "benhNhanID": 1,
  "thuocID": 5
}
Contraindication Check Response
{
  "hasWarning": true,
  "riskLevel": "Tuyet doi",
  "message": "This medicine is contraindicated for pregnant patients.",
  "clinicalConsequence": "May cause serious fetal harm."
}
Drug Interaction APIs
GET    /api/interactions
GET    /api/interactions/{id}
POST   /api/interactions
PUT    /api/interactions/{id}
DELETE /api/interactions/{id}
POST   /api/interactions/check
Drug Interaction Check Request
{
  "maATC_1": "A01AA01",
  "maATC_2": "B01AC06"
}
Drug Interaction Check Response
{
  "hasInteraction": true,
  "level": "Severe",
  "mechanism": "Increases bleeding risk.",
  "recommendation": "Avoid combination or monitor closely."
}
Prescription APIs
GET    /api/prescriptions
GET    /api/prescriptions/{id}
POST   /api/prescriptions
PUT    /api/prescriptions/{id}
DELETE /api/prescriptions/{id}
POST   /api/prescriptions/check-safety
POST   /api/prescriptions/{id}/complete
POST   /api/prescriptions/{id}/override
Create Prescription Request
{
  "bacSiID": 1,
  "benhNhanID": 2,
  "chanDoan": "Respiratory infection",
  "medicines": [
    {
      "thuocID": 3,
      "soLuong": 10,
      "lieuMoiLan": 1,
      "soLanDungNgay": 3
    }
  ]
}
Safety Check Response
{
  "safe": false,
  "warnings": [
    {
      "type": "Contraindication",
      "medicine": "Drug A",
      "riskLevel": "Absolute",
      "message": "Not recommended for pregnant patients."
    },
    {
      "type": "Drug Interaction",
      "medicinePair": ["Drug A", "Drug B"],
      "riskLevel": "Severe",
      "message": "High risk of adverse reaction."
    }
  ]
}
Inventory APIs
GET   /api/inventory/summary
GET   /api/inventory/low-stock
GET   /api/inventory/expired
GET   /api/inventory/near-expiry
PATCH /api/inventory/{medicineId}/stock

Used to monitor stock quantity, minimum stock threshold, expiry dates, and restocking needs.

Audit Log APIs
GET /api/audit-logs
GET /api/audit-logs/{id}
GET /api/audit-logs/filter

Audit logs should record:

User ID
Table name
Action
Timestamp
Old value
New value
Override reason
4. Role-Based Access Control
Admin

Can access:

Dashboard
Users
Medicines
Patients
Prescriptions
Contraindication Rules
Drug Interaction Rules
Inventory
Audit Logs
Settings
Doctor

Can access:

Dashboard
Patients
Prescriptions
Medicine Catalog
Contraindication Checking
Drug Interaction Checking

Doctor can override warnings only if a reason is provided.

Pharmacist

Can access:

Dashboard
Medicine Catalog
Inventory
Prescriptions
Drug Interaction Information
Low Stock and Expiry Alerts
5. Backend Validation Rules

The backend should validate:

Username must be unique
Username must have at least 4 characters
Medicine ATC code must be unique
Stock quantity cannot be negative
Minimum stock cannot be negative
Expiry date is required
Patient weight must be greater than 0 if provided
Prescription quantity must be greater than 0
Duplicate medicine in the same prescription is not allowed
Drug interaction pairs must not be duplicated
Override reason is required when ignoring severe warnings
6. Suggested Technical Architecture

Use a three-layer architecture:

Frontend Desktop App
        ↓
RESTful API Layer
        ↓
Backend Business Logic Layer
        ↓
Database Access Layer
        ↓
MySQL Database

Suggested technology stack:

Frontend: React / Electron / WPF / JavaFX
Backend: Node.js Express / ASP.NET Core / Spring Boot
Database: MySQL
Authentication: JWT
API Style: RESTful API
7. Important Figma Design Note

In Figma, design the frontend screens and also include one additional page called System Flow & API Overview.

This page should visually show:

User Interface
→ API Request
→ Backend Validation
→ Business Rule Checking
→ MySQL Database
→ API Response
→ UI Alert or Success Message

This helps explain that the system has not only a UI, but also backend logic and APIs behind every action.