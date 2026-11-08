import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function Tabs<T extends string | boolean>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1 rounded-lg bg-neutral-200 p-1", className)}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 cursor-pointer rounded-md px-3 py-2 transition-colors",
            option.value === value ? "bg-white" : "not-hover:text-neutral-600 hover:bg-neutral-300",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
