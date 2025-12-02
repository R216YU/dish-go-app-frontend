export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600 dark:border-gray-700 dark:border-t-green-400" />
    </div>
  );
}
