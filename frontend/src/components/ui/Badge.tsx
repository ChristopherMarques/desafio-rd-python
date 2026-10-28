import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "blue" | "orange" | "teal" | "coral" | "slate" | "danger";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "blue",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    blue: "bg-rd-blue/15 text-blue-400 border-rd-blue/30",
    orange: "bg-rd-orange/15 text-orange-400 border-rd-orange/30",
    teal: "bg-rd-teal/15 text-emerald-400 border-rd-teal/30",
    coral: "bg-red-500/15 text-red-400 border-red-500/30",
    slate: "bg-slate-800 text-slate-300 border-slate-700",
    danger: "bg-red-950/60 text-red-300 border-red-700/50",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full border transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
