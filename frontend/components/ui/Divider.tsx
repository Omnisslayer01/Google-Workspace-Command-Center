/**
 * Divider — horizontal rule with an optional centred label.
 */

interface DividerProps {
  label?: string;
}

export default function Divider({ label }: DividerProps) {
  if (!label) {
    return <hr className="border-stone-200" />;
  }

  return (
    <div className="relative flex items-center">
      <div className="flex-grow border-t border-stone-200" />
      <span className="mx-3 shrink-0 text-xs text-stone-400 select-none">
        {label}
      </span>
      <div className="flex-grow border-t border-stone-200" />
    </div>
  );
}
