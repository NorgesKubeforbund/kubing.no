import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "border-transparent bg-link-text text-white hover:bg-link-text/85",
  danger: "border-transparent bg-accent-text text-white hover:bg-[#B40000]",
  secondary: "border-neutral-800 bg-white text-foreground hover:bg-neutral-100",
};

const sizes = {
  md: "px-4 py-2.5",
  sm: "px-3 py-1.5 text-sm",
};

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClassName(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border transition-colors disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400",
    variants[variant],
    sizes[size],
  );
}

export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type={type}
      className={cn(buttonClassName(variant, size), className)}
      {...props}
    />
  );
}
