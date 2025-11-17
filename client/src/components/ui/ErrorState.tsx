interface ErrorStateProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, details, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="mb-4 text-4xl">⚠️</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-md mb-2">{message}</p>
      {details && <p className="text-gray-500 text-xs max-w-md mb-6">{details}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

