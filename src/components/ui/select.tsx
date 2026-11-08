import { ComponentProps } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClassName, ButtonSize } from "@/components/ui/button";

export default function Select({
  size = "md",
  className,
  children,
  ...props
}: Omit<ComponentProps<"select">, "size"> & {
  size?: ButtonSize;
}) {
  return (
    <div className={cn("relative w-fit", className)}>
      <select
        className={cn(buttonClassName("secondary", size), "w-full appearance-none text-left", size === "sm" ? "pr-8" : "pr-10")}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-foreground",
          size === "sm" ? "right-2.5 h-4 w-4" : "right-3.5 h-4 w-4",
        )}
      />
    </div>
  );
}
