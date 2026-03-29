import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import './index.css';
import { SensorProvider } from './src/context/SensorContext';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    declare props: ErrorBoundaryProps;
    constructor(props: ErrorBoundaryProps) {
        super(props);
    }

    state: ErrorBoundaryState = {
        hasError: false,
        error: null
    };

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace', backgroundColor: '#fff', height: '100vh', overflow: 'auto' }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Something went wrong.</h1>
                    <div style={{ padding: '10px', background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '4px' }}>
                        <strong>Error:</strong> {this.state.error?.toString()}
                    </div>
                    {this.state.error?.stack && (
                        <pre style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                            {this.state.error.stack}
                        </pre>
                    )}
                </div>
            );
        }

        return (this.props as any).children;
    }
}

// Root render
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <SensorProvider>
                <App />
            </SensorProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
