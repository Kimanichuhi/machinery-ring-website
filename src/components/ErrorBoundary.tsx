import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface State { error: Error | null }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
    // Broadcast to diagnostics panel
    window.dispatchEvent(new CustomEvent("mr-diagnostics", {
      detail: { type: "error", message: error.message, stack: error.stack, componentStack: info.componentStack, at: new Date().toISOString() }
    }));
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-lg w-full border border-destructive/40 rounded-xl bg-destructive/5 p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4 break-words">{this.state.error.message}</p>
            <div className="flex justify-center gap-2">
              <Button variant="hero" onClick={this.reset}>Try again</Button>
              <Button variant="outline" onClick={() => (window.location.href = "/")}>Go home</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
