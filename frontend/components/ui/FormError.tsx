/**
 * FormError — full-width banner for top-level API/form errors.
 */

interface FormErrorProps {
  message?: string | null;
}

export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
    >
      {/* Icon */}
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-5a.75.75 0 001.5 0V9a.75.75 0 00-1.5 0v4zm.75-6.5a.875.875 0 110 1.75.875.875 0 010-1.75z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}
