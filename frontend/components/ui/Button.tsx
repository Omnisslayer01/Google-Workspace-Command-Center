/**
 * Button — primary and secondary variants with loading state.
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

export default function Button({
  children,
  loading = false,
  variant = "primary",
  fullWidth = true,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold px-4 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-stone-900 text-white hover:bg-stone-700 focus-visible:ring-stone-900 disabled:bg-stone-300 disabled:text-stone-500",
    secondary:
      "bg-white text-stone-800 border border-stone-300 hover:bg-stone-50 focus-visible:ring-stone-400 disabled:opacity-50",
  };

  return (
    <button
      disabled={disabled || loading}
      className={[
        base,
        variants[variant],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
