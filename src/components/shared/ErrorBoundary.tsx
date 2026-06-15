import { Component, type ErrorInfo, type ReactNode } from "react";
import { Coffee, RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <Coffee className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Algo salió mal
            </h1>
            <p className="text-sm text-muted-foreground">
              Ocurrió un error inesperado en la aplicación. No te preocupes, tus
              datos están a salvo.
            </p>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <div className="rounded-lg border bg-muted/40 p-3 text-left">
              <p className="text-xs font-mono text-destructive wrap-breack-word">
                {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={this.handleReload} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
            <Button
              variant="outline"
              onClick={this.handleGoHome}
              className="w-full sm:w-auto"
            >
              <Home className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
