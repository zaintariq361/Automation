/** Treats unset values and unfilled ".env.example" placeholders (e.g. "REPLACE_ME") as not configured. */
export function isConfiguredValue(value: string | undefined | null): boolean {
  return Boolean(value && !value.includes("REPLACE_ME"));
}
