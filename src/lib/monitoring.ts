// Lightweight error monitoring: uncaught errors are written to the client_errors
// table (see migration 0006) and read by admins at /admin/errors. It is a
// deliberately small stand-in for a hosted tracker — same idea, no third party.

const MAX_REPORTS_PER_SESSION = 10;
const seen = new Set<string>();
let sent = 0;

// Browser noise that says nothing about our code.
const IGNORED = [/ResizeObserver loop/i, /^Script error\.?$/i, /Non-Error promise rejection/i];

export function shouldReport(message: string): boolean {
  if (!message || IGNORED.some((re) => re.test(message))) return false;
  if (sent >= MAX_REPORTS_PER_SESSION || seen.has(message)) return false;
  return true;
}

/** Best-effort: reporting an error must never throw or trigger another report. */
export async function reportError(error: unknown, context?: string): Promise<void> {
  try {
    if (!import.meta.env.PROD) return;
    const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown error');
    const message = (context ? `[${context}] ` : '') + err.message;
    if (!shouldReport(message)) return;
    seen.add(message);
    sent += 1;

    const { supabase } = await import('./supabaseClient');
    await supabase.from('client_errors').insert({
      message: message.slice(0, 2000),
      stack: err.stack?.slice(0, 8000) ?? null,
      url: window.location.href.slice(0, 2000),
      user_agent: navigator.userAgent.slice(0, 500),
    });
  } catch {
    // swallow — nothing sensible left to do
  }
}

export function installGlobalErrorReporting(): void {
  window.addEventListener('error', (event) => {
    void reportError(event.error ?? event.message, 'window.onerror');
  });
  window.addEventListener('unhandledrejection', (event) => {
    void reportError(event.reason, 'unhandledrejection');
  });
}
