# Hopitel Frontend (React)

A modern healthcare management system frontend built with React, TypeScript, and Tailwind CSS.

## Features

- Multi-role authentication (Patient, Doctor, Hospital Admin, Super Admin, Lab Technician)
- Appointment management
- Real-time messaging
- Medical results access
- Hospital and doctor search
- Chatbot for health assistance

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** React Context + Hooks
- **HTTP Client:** Axios
- **Icons:** Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components
│   ├── layout/        # Layout components
│   └── forms/         # Form components
├── features/          # Feature modules
│   ├── auth/          # Authentication
│   ├── patient/       # Patient features
│   ├── medecin/       # Doctor features
│   ├── admin/         # Hospital admin features
│   ├── super-admin/   # Super admin features
│   ├── laborantin/    # Lab technician features
│   └── messaging/     # Messaging features
├── hooks/             # Custom React hooks
├── services/          # API services
├── types/             # TypeScript types
├── utils/             # Utility functions
└── styles/            # Global styles
```

## Roles

| Role | Color | Description |
|------|-------|-------------|
| Patient | Blue (#1565C0) | Book appointments, view results |
| Doctor | Green (#2E7D32) | Manage schedule, view patients |
| Hospital Admin | Orange (#E65100) | Manage hospital staff and services |
| Super Admin | Purple (#6A1B9A) | Manage all hospitals |
| Lab Technician | Teal (#00838F) | Manage medical results |