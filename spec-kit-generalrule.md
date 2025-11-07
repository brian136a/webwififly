# Spec-Kit: Next.js Best Practices and Guidelines

## Objective
This document outlines general "Do" and "Do Not" rules for working with Next.js, incorporating lessons learned from compatibility issues, particularly regarding Turbopack.

## Do Rules
- **Verify Library Compatibility:** Before integrating any new external JavaScript library, especially those performing background tasks like network measurements (e.g., Web Workers), check its compatibility with your Next.js version and development environment (Turbopack/Webpack).
- **Use Standard Configurations:** Ensure your `package.json` and `next.config.ts` (or `.js`) are valid JSON/JS and use officially supported configuration options for your Next.js version. Use TypeScript types like `NextConfig` for type checking.
- **Manage Dependencies Carefully:** Explicitly list all required dependencies (e.g., `framer-motion`, `lucide-react`) in your `package.json` `dependencies` or `devDependencies`. Be aware of transitive dependencies and potential conflicts.
- **Leverage Official Documentation:** Refer to the official Next.js documentation for the specific version you are using for configuration options, API usage, and best practices.
- **Test Across Environments:** Test your application thoroughly in both development (with your chosen server - Turbopack/standard) and production builds.
- **Use Semantic Versioning:** Pin or use caret/tilde ranges carefully for dependencies in `package.json` to avoid unexpected breaking changes from minor/patch updates.
- **Isolate Problematic Code:** When encountering issues with specific features or libraries, consider isolating them into separate pages or components to prevent affecting the stability of the entire application.
- **Check Network Tab:** When debugging external script loading (e.g., from the `public` directory), use the browser's Network tab to verify successful requests (200 status) and check for errors.
- **Clear Caches:** When changing configurations, dependencies, or experiencing unexpected behavior, clear the `.next` build cache and potentially `node_modules` to ensure a clean state.
- **Understand Route Structure:** Be familiar with the Next.js App Router file system conventions (`app/` directory, `page.tsx`, `layout.tsx`, etc.).

## Do Not Rules
- **Assume Turbopack Compatibility:** Do not assume that all libraries compatible with the standard Webpack-based Next.js server will work seamlessly with Turbopack. Check for specific limitations (e.g., `importModule`, `loadModule`).
- **Ignore Configuration Warnings:** Do not ignore warnings from Next.js during startup or build (e.g., `Invalid next.config.ts options detected`). Address them promptly.
- **Use Comments in JSON:** Do not add comments (`//`) or trailing commas in `package.json` or other JSON files. JSON does not support these.
- **Mix Server and Client Code Casually:** Do not use Node.js-specific modules directly in client-side code without proper checks or server-side rendering methods (`getStaticProps`, `getServerSideProps`).
- **Downgrade Version Carelessly:** Do not downgrade Next.js versions without considering the impact on dependencies, configuration options, and potential loss of features.
- **Ignore Specific Error Messages:** Do not dismiss specific error messages like "Module not found" or "Invalid config". Investigate their root cause (missing dependency, incorrect path, invalid config option).
- **Modify node_modules Directly:** Do not manually edit files within the `node_modules` folder.
- **Assume Default Behavior:** Do not assume default behavior for new features without checking the documentation (e.g., Turbopack being the default in Next.js 16+).

## Key Learnings
- **Turbopack Limitations:** Next.js 16.0.1's Turbopack has specific limitations with Webpack loader features (`importModule`, `loadModule`), affecting libraries like LibreSpeed that rely on Web Workers.
- **Dependency Management:** Missing or incorrectly listed dependencies can break the build process even if the core application logic is correct.
- **Configuration Sensitivity:** Small errors in `package.json` or `next.config.ts` (like comments or trailing commas) can prevent the application from running.
- **Environment Differences:** Features might behave differently or fail entirely between the development server (Turbopack vs. Webpack) and production builds.