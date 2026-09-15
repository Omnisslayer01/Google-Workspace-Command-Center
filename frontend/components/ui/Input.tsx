/**
 * Input — labelled text/email/password field with error state.
 */

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, error, className = "", ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-stone-700"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          "w-full rounded-lg border px-3.5 py-2.5 text-sm text-stone-900",
          "placeholder:text-stone-400 bg-white",
          "outline-none transition-colors",
          "focus:ring-2 focus:ring-stone-900 focus:border-transparent",
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-stone-300 hover:border-stone-400",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
