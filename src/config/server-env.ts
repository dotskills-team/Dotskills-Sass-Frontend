import "server-only";

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/**
 * Server-only — deliberately a separate module from `env.ts`. Route
 * Handlers importing this never pull in `publicEnv`'s NEXT_PUBLIC_*
 * validation, and (more importantly) client code that only needs
 * `publicEnv` never triggers this file's eager `required()` check —
 * a single shared module previously crashed every browser session
 * because ES modules evaluate top-to-bottom regardless of which named
 * export is actually used, so importing `publicEnv` also ran this
 * check against `process.env.BACKEND_INTERNAL_API_URL`, which is
 * `undefined` in the browser bundle (only NEXT_PUBLIC_* vars are
 * inlined client-side).
 */
export const serverEnv = {
  backendInternalApiUrl: required(
    "BACKEND_INTERNAL_API_URL",
    process.env.BACKEND_INTERNAL_API_URL,
  ),
} as const;
