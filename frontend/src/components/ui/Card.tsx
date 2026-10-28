import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "blue" | "orange" | "teal" | "none";
}

export function Card({ className, glow = "none", children, ...props }: CardProps) {
  const glowStyles = {
    none: "",
    blue: "border-rd-blue/40 shadow-[0_0_20px_rgba(0,115,255,0.15)]",
    orange: "border-rd-orange/40 shadow-[0_0_20px_rgba(242,92,5,0.15)]",
    teal: "border-rd-teal/40 shadow-[0_0_20px_rgba(0,179,126,0.15)]",
  };

  return (
    <div
      className={cn(
        "rounded-xl bg-rd-navy-card border border-rd-navy-border shadow-sketch text-slate-100 p-5",
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4 border-b border-rd-navy-border/60", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold tracking-tight text-white flex items-center gap-2", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-slate-400 font-normal leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
}
