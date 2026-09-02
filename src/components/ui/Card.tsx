import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ className, elevated = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#201e1d]/10 p-6 transition-all duration-300",
        elevated ? "bg-[#faede0] shadow-md" : "bg-[#fbf1e4] shadow-sm",
        "hover:shadow-lg hover:border-[#c67139]/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
