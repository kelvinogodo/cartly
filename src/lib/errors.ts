/**
 * Turns a database error from a public form into something a visitor can act on.
 * Rate-limit triggers raise "rate_limited: <friendly text>"; check-constraint
 * violations (SQLSTATE 23514) mean the input was malformed.
 */
export function friendlyFormError(error: { message?: string; code?: string } | null | undefined, fallback: string): string {
  if (!error) return fallback;
  const message = error.message ?? '';
  if (message.startsWith('rate_limited:')) {
    const text = message.slice('rate_limited:'.length).trim();
    return text ? text.charAt(0).toUpperCase() + text.slice(1) + '.' : 'Please try again later.';
  }
  if (error.code === '23514') return 'Please check your email address and message, then try again.';
  return fallback;
}
