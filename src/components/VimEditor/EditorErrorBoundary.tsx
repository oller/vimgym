import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

type EditorErrorBoundaryProps = {
  children: ReactNode;
  onReset?: () => void;
};

type EditorErrorBoundaryState = {
  error: Error | null;
};

export class EditorErrorBoundary extends Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // biome-ignore lint/suspicious/noConsole: Error boundary reports unhandled errors
    console.error("EditorErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          aria-live="assertive"
          className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-tokyo-night-storm border border-red-500/40 rounded-md font-roboto-mono text-center shadow-lg"
          role="alert"
        >
          <div className="text-red-400 font-bold text-base mb-2 tracking-wider">
            [!] VIM ENGINE SUBSYSTEM CRASH
          </div>
          <p className="text-gray-400 text-xs max-w-md mb-4 break-words font-mono bg-black/40 p-3 rounded border border-gray-800">
            {this.state.error.message ||
              "An unexpected error occurred in the editor engine."}
          </p>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 text-xs uppercase tracking-wider bg-tokyo-night-storm border border-tokyo-night-sapphire text-tokyo-night-sapphire hover:bg-tokyo-night-sapphire hover:text-tokyo-night transition-colors rounded cursor-pointer"
              onClick={this.handleReset}
              type="button"
            >
              Reset Level
            </button>
            <button
              className="px-4 py-2 text-xs uppercase tracking-wider bg-tokyo-night-storm border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors rounded cursor-pointer"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
