// Barrel for the shared library. Consumers (page entry points and Vite build
// plugins) import from `lib` rather than reaching into individual modules, so
// the public surface is declared in one place and deep-import churn is avoided.
//
// Convention: a folder exposes its public API through an index.ts barrel when
// that API is imported from elsewhere. Page folders (landing/, comparison/,
// stack-builder/) are Vite entry points that nothing imports, so they have no
// barrel.

export * from "./columns";
export * from "./data";
export * from "./modal";
export * from "./present";
// Types only: schema.ts also exports the runtime Zod schemas, and re-exporting
// them as values would drag Zod into the browser bundle through this barrel.
// The Zod values are imported directly from "./schema" by the build-time
// scripts (validate, gen-schema, data-add), never through this barrel.
export type * from "./schema";
