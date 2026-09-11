import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Catches render-time errors anywhere below it in the tree so a broken
// screen shows a message instead of leaving the page blank. Does NOT catch
// errors thrown while ES modules are first evaluated (before React even
// starts rendering) — see the dynamic import in main.tsx for that case.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error in Cartly:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
