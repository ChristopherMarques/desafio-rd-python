import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "orange" | "teal" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-rd-navy-dark disabled:opacity-50 disabled:pointer-events-none select-none active:translate-y-0.5";

    const variantStyles = {
      primary:
        "bg-rd-blue hover:bg-rd-blue-hover text-white shadow-sketch-blue focus:ring-rd-blue border border-blue-400/30",
      secondary:
        "bg-rd-navy-card hover:bg-rd-navy-subtle text-slate-200 border border-rd-navy-border shadow-sketch focus:ring-slate-400",
      orange:
        "bg-rd-orange hover:bg-rd-orange-hover text-white shadow-sketch-orange focus:ring-rd-orange border border-orange-400/30",
      teal:
        "bg-rd-teal hover:bg-rd-teal-hover text-white shadow-sketch focus:ring-rd-teal border border-emerald-400/30",
      outline:
        "bg-transparent hover:bg-rd-navy-subtle text-slate-300 border-2 border-rd-navy-border focus:ring-rd-blue",
      danger:
        "bg-rd-red hover:bg-red-700 text-white shadow-sketch focus:ring-red-500 border border-red-400/30",
      ghost:
        "bg-transparent hover:bg-rd-navy-subtle text-slate-300 hover:text-white focus:ring-rd-blue",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-md gap-1.5",
      md: "h-10 px-4 text-sm rounded-lg gap-2",
      lg: "h-12 px-6 text-base rounded-lg gap-2.5 font-semibold",
      icon: "h-10 w-10 p-0 rounded-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
