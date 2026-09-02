import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "sage";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-4 py-1.5 text-xs",
      md: "px-6 py-2.5 text-sm",
      lg: "px-8 py-3 text-base",
    };

    const variantClasses = {
      primary: "bg-[#c67139] text-[#f5ead8] hover:bg-[#a95629] shadow-sm",
      secondary: "bg-transparent text-[#201e1d] border border-[#201e1d]/20 hover:bg-[#201e1d]/5",
      ghost: "bg-transparent text-[#6b635c] hover:text-[#201e1d] hover:bg-[#201e1d]/5",
      sage: "bg-[#7a8a5e] text-[#f5ead8] hover:bg-[#5e6c46] shadow-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "btn-pill inline-flex items-center justify-center font-medium disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
