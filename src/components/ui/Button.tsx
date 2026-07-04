import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  // bg-primary (#6366f1) with white text only hit 4.46:1 — just under WCAG AA's 4.5:1
  // minimum (found via axe-core audit). indigo-600 keeps the same hue family at a
  // contrast-safe shade.
  primary:
    "bg-indigo-600 text-white hover:brightness-110 active:brightness-95 shadow-[0_0_0_1px_rgba(99,102,241,0.4)]",
  secondary:
    "bg-surface text-text border border-border hover:border-primary/60 hover:bg-white/[0.03]",
  ghost: "bg-transparent text-muted hover:text-text hover:bg-white/[0.04]",
  danger: "bg-danger text-white hover:brightness-110 active:brightness-95",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
  lg: "text-base px-6 py-3 gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
