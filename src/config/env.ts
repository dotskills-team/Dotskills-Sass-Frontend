function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/** Public — bundled into client JS. Never put secrets here. */
export const publicEnv = {
  apiUrl: required("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL),
} as const;
