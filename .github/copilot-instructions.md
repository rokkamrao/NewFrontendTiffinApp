# Copilot Instructions for TiffinApp

## Project Overview
- **Framework:** Angular (CLI v20.3.6)
- **Purpose:** Food delivery/tiffin service web application
- **Structure:**
  - `src/app/`: Main application code (routes, configs, root component)
  - `src/`: Entry points (`main.ts`, `main.server.ts`), server integration, global styles
  - `public/`: Static assets

## Key Workflows
- **Start Dev Server:** `ng serve` (http://localhost:4200/)
- **Build:** `ng build` (outputs to `dist/`)
- **Unit Tests:** `ng test` (Karma)
- **E2E Tests:** `ng e2e` (add framework as needed)
- **NPM Scripts:**
  - `npm start` (may alias `ng serve`)
  - `npm test` (may alias `ng test`)

## Patterns & Conventions
- **Routing:**
  - Client routes: `src/app/app.routes.ts`
  - Server routes: `src/app/app.routes.server.ts`
- **Config:**
  - Client: `src/app/app.config.ts`
  - Server: `src/app/app.config.server.ts`
- **Entry Points:**
  - Client: `src/main.ts`
  - Server: `src/main.server.ts`, `src/server.ts`
- **Styling:**
  - Tailwind CSS (`tailwind.config.js`, `postcss.config.js`)
  - Global: `src/styles.css`, `src/app/app.css`
- **TypeScript:**
  - Use strict typing; configs in `tsconfig*.json`

## Integration & Dependencies
- **Angular CLI** for builds, scaffolding, and testing
- **Tailwind CSS** for utility-first styling
- **Karma** for unit testing
- **No default e2e framework** (add as needed)

## Examples
- Add a new route: Edit `src/app/app.routes.ts` (client) or `app.routes.server.ts` (server)
- Add a new component: `ng generate component <name>`
- Update global styles: Edit `src/styles.css`

## Tips for AI Agents
- Follow Angular CLI conventions for file structure and naming
- Keep client/server config and routes in sync when needed
- Reference this file and `README.md` for workflow commands and structure
- Prefer updating existing config/routes files over creating new ones unless extending functionality

---
For more, see <https://angular.dev/tools/cli> and the project `README.md`.
