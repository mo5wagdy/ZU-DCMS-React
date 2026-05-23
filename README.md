# 🎨 ZU-DCMS Frontend — React Application

> Building the interface between patients, students, and admins.  
> Where UX meets healthcare efficiency.

---

## 🚀 Overview

**ZU-DCMS Frontend** is a modern, responsive React application that powers the user-facing interfaces of the Zagazig University Dental Clinic Management System.

Built with **React 18**, **TypeScript**, and **Tailwind CSS**, this application delivers seamless experiences across:
- 👥 Patient booking and appointment management
- 🎓 Student progress tracking and case monitoring
- 👨‍⚕️ Intern doctor case assignment and supervision
- 🔐 Admin dashboard with system-wide control

---

## 🎬 Features

### 🌍 Multi-Language Support
- Full **i18n** (internationalization) support with i18next
- Arabic & English ready
- Runtime language switching

### 📱 Responsive Design
- Mobile-first approach with **Tailwind CSS**
- Fully responsive across all devices
- Dark/Light theme support with **next-themes**

### 🧩 Component Architecture
- **Radix UI** primitives for accessible, unstyled components
- Custom component library with **shadcn/ui** patterns
- Composable, reusable components throughout

### ⚡ State Management
- **Zustand** for lightweight global state
- **TanStack React Query** for server state & caching
- Efficient data synchronization

### 🔌 API Integration
- **Axios** for HTTP requests
- Type-safe API communication
- Real-time data fetching with React Query

### 📊 Advanced UI Components
- **Recharts** for data visualization
- **Framer Motion** for smooth animations
- **Embla Carousel** for image galleries
- Command palette with **cmdk**
- Toast notifications with **Sonner**
- Form handling with **React Hook Form** + **Zod** validation

### 🗺️ Routing
- **React Router DOM** v6 for client-side navigation
- Nested routes and dynamic routing
- Protected routes for role-based access

### 🌐 Internationalization
- Complete i18n setup with detection
- Language persistence
- RTL support for Arabic

### 🧪 Testing
- **Vitest** for unit testing
- **React Testing Library** for component testing
- JSDOM for DOM simulation

---

## 📁 Project Structure

```
src/
├── api/              # API client configuration & requests
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization setup & translations
├── lib/             # Utility functions & helpers
├── pages/           # Page components (routes)
├── router/          # Routing configuration
├── store/           # Zustand global state
├── types/           # TypeScript type definitions
├── utils/           # General utilities
└── test/            # Test files & test utilities
```

---

## 🛠️ Tech Stack

### Core
- **React** 18.3 — UI library
- **TypeScript** 5.8 — Type safety
- **Vite** 5.4 — Build tool & dev server
- **React Router DOM** 6.30 — Client-side routing

### Styling & UI
- **Tailwind CSS** 3.4 — Utility-first CSS
- **Radix UI** — Accessible component primitives
- **Framer Motion** 12.38 — Animation library
- **Lucide React** — Icon library
- **Next Themes** — Dark mode support

### State & Data
- **Zustand** 5.0 — Global state management
- **TanStack React Query** 5.83 — Server state management
- **Axios** 1.15 — HTTP client

### Forms & Validation
- **React Hook Form** 7.61 — Form management
- **Zod** 3.23 — Schema validation

### Utilities
- **Date-fns** 3.6 — Date manipulation
- **i18next** 26.0 — Internationalization
- **Sonner** 1.7 — Toast notifications
- **Input OTP** 1.4 — OTP input handling

### Development
- **Vitest** 3.2 — Unit testing
- **Testing Library** — Component testing
- **ESLint** 9.32 — Code linting
- **PostCSS** 8.5 — CSS processing

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/mo5wagdy/ZU-DCMS-React.git
cd ZU-DCMS-React

# Install dependencies
npm install
# or
bun install
```

### Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Update .env with your backend API URL
VITE_API_BASE_URL=http://localhost:5000/api
```

### Development Server

```bash
# Start the development server
npm run dev
# or
bun dev

# Application opens at http://localhost:5173
```

### Building for Production

```bash
# Build the optimized production bundle
npm run build

# Preview the production build locally
npm run preview
```

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm run build:dev        # Build in development mode

# Code Quality
npm run lint             # Run ESLint

# Testing
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
```

---

## 🏗️ Architecture

### Clean Component Structure
- **Smart Components** — Connected to state & API
- **Presentational Components** — Dumb, reusable UI components
- **Custom Hooks** — Extracted logic for reusability

### State Management Strategy
- **Global State** — Authentication, user data (Zustand)
- **Server State** — API data, caching (React Query)
- **Local State** — Form inputs, UI state (useState)

### API Integration Pattern
```typescript
// Custom hooks for data fetching
useQuery() // React Query for caching
useMutation() // React Query for mutations
```

### Type Safety
- Full TypeScript coverage
- Strict mode enabled
- Custom types in `src/types/`

---

## 🎯 Key Features Implementation

### Patient Booking Flow
- Interactive date/time picker
- Real-time availability checking
- Confirmation workflow
- Appointment history

### Student Dashboard
- Progress tracking visualization
- Case assignment queue
- Performance analytics with Recharts
- Academic requirements progress

### Admin Control Panel
- System configuration management
- User management interfaces
- Report generation & export
- Real-time system monitoring

### Authentication
- Role-based access control
- Protected routes
- Token management
- Session handling

---

## 🎨 Styling Approach

- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theming
- **Dark Mode** support built-in
- **Responsive Design** patterns throughout

---

## 🌐 Localization

The app supports multiple languages with i18next:

```typescript
// Language detection: Browser language → Fallback to English
// Manual language switching: Available in settings
// RTL Support: Automatic for Arabic
```

---

## 📦 Dependencies Overview

### UI Components (Radix UI)
Over 20+ Radix UI primitives for accessible, unstyled components

### Data Fetching
- Axios for HTTP
- React Query for caching & synchronization

### State Management
- Zustand for lightweight global state
- React Hook Form for form state

### Animations
- Framer Motion for smooth transitions
- CSS animations with Tailwind

---

## 🔗 Backend Integration

This frontend consumes the **ZU-DCMS** .NET backend API:

**Backend Repository:** [mo5wagdy/ZU-DCMS](https://github.com/mo5wagdy/ZU-DCMS)

**API Communication:**
- All requests configured in `src/api/`
- Base URL via environment variables
- Type-safe request/response handling
- Automatic error handling & retries

---

## 🧪 Testing

```bash
# Run tests once
npm run test

# Watch mode for development
npm run test:watch
```

Test setup includes:
- Vitest configuration
- Testing Library utilities
- JSDOM environment

---

## 📊 UI Components Demo

### Provided Components
- Dialogs & Modals (Radix UI)
- Forms & Inputs (React Hook Form + Zod)
- Data Tables & Lists
- Navigation & Menus
- Cards & Layouts
- Progress Indicators
- Toast Notifications (Sonner)
- Charts & Graphs (Recharts)

---

## 🎬 System in Action

### Dashboard Overview
![Dashboard Demo](https://via.placeholder.com/1200x600?text=Admin+Dashboard+Overview)

### Patient Booking Interface
![Booking System](https://via.placeholder.com/1200x600?text=Patient+Booking+System)

### Student Progress View
![Student Dashboard](https://via.placeholder.com/1200x600?text=Student+Progress+Tracking)

### Admin Analytics
![Analytics Dashboard](https://via.placeholder.com/1200x600?text=System+Analytics+&+Reports)

### Case Management
![Case Assignment](https://via.placeholder.com/1200x600?text=Smart+Case+Distribution)

---

## 🔐 Security

- ✅ Environment variables for sensitive data
- ✅ XSS protection with React
- ✅ CSRF token handling
- ✅ Secure token storage
- ✅ Role-based access control (RBAC)

---

## 🚀 Performance Optimizations

- 📦 Code splitting with lazy loading
- 🎯 Component-level code splitting
- 💾 React Query caching strategies
- 🖼️ Image optimization
- ⚡ Vite fast refresh
- 📊 Bundle analysis ready

---

## 🔮 Future Enhancements

- Progressive Web App (PWA) support
- Offline functionality
- Push notifications
- Advanced analytics
- Mobile app (React Native)
- E2E testing (Cypress/Playwright)
- Performance monitoring
- Advanced filtering & search

---

## 📝 Contributing

Contributions are welcome! Please:

1. Follow the existing code style
2. Write TypeScript with strict mode
3. Add tests for new features
4. Update documentation
5. Use meaningful commit messages

---

## 📄 License

This project is licensed under the Apache License 2.0.

---

## 🤝 Related Projects

- **Backend API:** [ZU-DCMS](https://github.com/mo5wagdy/ZU-DCMS)
- Built with ❤️ for Zagazig University Dental Clinic

---

> Built for clarity.  
> Designed for users.  
> Engineered for performance.
