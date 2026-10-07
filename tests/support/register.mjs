// Lets `node --test` import server modules from src/ directly:
// - "server-only" (a Next.js build-time guard) resolves to an empty module;
// - the "@/…" path alias resolves to src/…;
// - extensionless relative imports ("../config") resolve to the .ts file.
import { register } from "node:module";

register("./resolve-hooks.mjs", import.meta.url);
