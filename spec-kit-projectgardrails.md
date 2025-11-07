# Project Guardrails & Protection Guidelines

## Objective
This document serves as a protective guide for the core functionality of the Wififly application (`wififly-app`). It outlines critical files and directories that must be preserved and defines strict rules for any future modifications to prevent accidental breakage of the working application.

## Core Application Scope
The "core application" consists of the following pages and their associated files, which are confirmed to be working correctly:
- **Home Page:** `src/app/page.tsx`
- **Struggle Page:** `src/app/struggle/page.tsx`
- **Setup Page:** `src/app/setup/page.tsx`
- **Root Layout:** `src/app/layout.tsx`
- **Global Styles:** `src/app/globals.css`
- **Shared Components:** `src/components/` (e.g., `Footer.tsx`, `StruggleCard.tsx`)
- **State Management (Zustand):** `src/store/` (e.g., `setupStore.ts`)
- **Libraries/Types (if confirmed core-only usage):** `src/lib/` and `src/types/` (only if they are *not* related to the deleted `/test` page)

## Critical Files and Directories (DO NOT MODIFY/DELETE)
These files and directories are fundamental to the core application's stability and must be protected:

- `src/app/page.tsx`
- `src/app/struggle/` (and all its contents)
- `src/app/setup/` (and all its contents)
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/` (and its relevant contents)
- `src/store/` (and its contents)
- `package.json` (Dependencies for core functionality must be preserved)
- `next.config.ts` (Current stable configuration must be preserved)
- `tsconfig.json`
- `public/images/` (Assets for core pages)
- `public/librespeed/` (Static assets - *may* be needed for future speed test implementations)

## Modification Rules for Core Application

### DO Before Modifying Core Files:
1.  **Create a Backup:** Before making any significant changes to core files, create a backup or use Git to ensure you can revert easily.
2.  **Isolate Changes:** When adding new features, create new pages/routes (e.g., `/new-feature`) rather than modifying the existing core pages directly.
3.  **Verify Dependencies:** When adding new libraries, check for compatibility issues (e.g., with Turbopack) *before* integrating them into core pages. Test in isolation first.
4.  **Update Dependencies Carefully:** Only update dependencies in `package.json` after verifying they don't break existing functionality.
5.  **Test Thoroughly:** Always test the core pages (Home, Struggle, Setup) after any change to ensure they still load and function correctly.
6.  **Document Changes:** If changes are made to core logic, document the reasoning and impact in this file or in the code itself.

### DO NOT Do:
1.  **Delete or Rename Core Files:** Never delete or rename the files/directories listed in the "Critical Files..." section without a full understanding of the impact and a proper migration plan.
2.  **Modify Core Logic Casually:** Avoid making changes to the main state management (`setupStore.ts`) or core page logic without a clear need and thorough testing.
3.  **Introduce Incompatible Libraries:** Do not integrate new external libraries into the core pages without confirming they are compatible with the current Next.js version (16.0.1 with Turbopack) and do not rely on unsupported features (e.g., `importModule`, `loadModule`).
4.  **Modify `next.config.ts` Unnecessarily:** Avoid changing Next.js configuration options unless absolutely necessary, and always understand the implications (e.g., Turbopack-specific options like `turbopack.root`).
5.  **Ignore Error Messages:** Do not proceed if changes cause build errors or runtime errors on the core pages. Investigate and resolve them immediately.
6.  **Share Core State/Logic Prematurely:** Be cautious about how new features access or modify the shared Zustand store (`setupStore.ts`) to avoid unintended side effects on the core flow.

## Lessons Learned (Applied Here)
- **Turbopack Compatibility:** Libraries relying on unsupported Webpack features (like `importModule`, `loadModule` used by LibreSpeed) can break the application when using Turbopack. Always check compatibility before integrating.
- **Dependency Management:** Missing or incorrect dependencies can break the build. Explicitly manage them in `package.json`.
- **Configuration Sensitivity:** Invalid configuration files (e.g., comments in JSON, unrecognized options) can prevent the application from starting.
- **Isolation:** Problematic features (like the `/test` page) should be isolated to prevent affecting the stability of the core application.

## Success Criteria for Future Changes
- The core pages (Home, Struggle, Setup) continue to function as expected after any new modification.
- The application builds and runs without errors related to the core scope.
- New features are added without regressions to existing functionality.

By adhering to these guardrails, the stability of the core Wififly application is protected while allowing for safe, future development.