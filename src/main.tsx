import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { installGlobalErrorReporting } from './lib/monitoring';

installGlobalErrorReporting();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}
const root = createRoot(container);

function renderStartupError(error: unknown) {
  console.error('Cartly failed to start:', error);
  root.render(
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <h1>Cartly couldn't start</h1>
      <p>{error instanceof Error ? error.message : 'Unknown startup error.'}</p>
    </div>
  );
}

// App (and its Supabase client dependency, which fails fast if
// VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are missing) is loaded
// via a dynamic import specifically so a misconfigured deployment renders
// a real error message instead of a blank page: a throw during a *static*
// import's module evaluation happens before React ever renders, so a React
// ErrorBoundary can't catch it — but a dynamic import() surfaces the same
// failure as a rejected promise we can catch here.
import('./App')
  .then(({ default: App }) => {
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  })
  .catch(renderStartupError);
