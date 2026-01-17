# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev          # Start development server (Vite, port 5173)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Architecture Overview

This is a React reservation/booking system frontend built with Vite, TypeScript, and shadcn/ui components. It connects to a backend API (default: `http://localhost:8080/api`, configurable via `VITE_API_URL`).

### Core Structure

- **Entry Point**: `src/main.tsx` renders `App.tsx`
- **Routing**: React Router with routes defined in `App.tsx`
  - `/` - Business listing (Index page)
  - `/business/:id` - Business detail with booking
  - `/dashboard` - Business owner management
- **State Management**: TanStack React Query for server state, React Context for auth

### Key Patterns

**API Layer** (`src/lib/api.ts`):
- Axios-based API client with JWT auth via interceptors
- Token stored in localStorage (`authToken`)
- Auto-logout on 401 responses
- API modules: `authApi`, `businessApi`, `offeringsApi`, `scheduleApi`, `reservationsApi`, `reviewsApi`

**Authentication** (`src/contexts/AuthContext.tsx`):
- `AuthProvider` wraps the app
- `useAuth()` hook provides: `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`
- JWT tokens persisted in localStorage

**Type Definitions** (`src/lib/types.ts`):
- All DTOs matching backend: `User`, `Business`, `Offering`, `Reservation`, `Review`
- Request/Response types for API calls
- `TimeSlot` and `BusyBlock` for scheduling

**UI Components** (`src/components/ui/`):
- shadcn/ui components (do not modify directly)
- Custom components in `src/components/`

### Path Aliases

`@/` maps to `./src/` (configured in `vite.config.ts` and `tsconfig.json`)

### Styling

- Tailwind CSS with CSS variables for theming
- Custom theme colors defined in `tailwind.config.ts` (available, occupied, closed for scheduling)
- HSL color variables in `src/index.css`
- shadcn/ui configuration in `components.json`

### Form Handling

- react-hook-form with zod validation
- Pattern used in `Dashboard.tsx` for business/offering forms
