import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fontMono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, fontMono = false, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-rd-navy-border bg-rd-navy-subtle px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-rd-blue focus:border-transparent transition-all",
          "disabled:cursor-not-allowed disabled:opacity-50",
          fontMono && "font-mono tracking-wider uppercase",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
