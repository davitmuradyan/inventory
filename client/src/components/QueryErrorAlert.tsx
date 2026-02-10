import { getErrorMessage } from "../api/client";

interface QueryErrorAlertProps {
  title?: string;
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function QueryErrorAlert({
  title = "Error loading data",
  error,
  onRetry,
  className = "",
}: QueryErrorAlertProps) {
  const message = getErrorMessage(error);
  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-800 sm:px-6 ${className}`}
      role="alert"
    >
      <strong className="font-medium">{title}</strong>
      <p className="mt-1 text-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Try again
        </button>
      )}
    </div>
  );
}
