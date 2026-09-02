import React from "react";
import { cn } from "@/lib/utils";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "terracotta" | "sage" | "outline";
}

export function Tag({ className, variant = "default", children, ...props }: TagProps) {
  const variantStyles = {
    default: "bg-[#efe1cb] text-[#6b635c] border-[#201e1d]/10",
    terracotta: "bg-[#c67139]/15 text-[#c67139] border-[#c67139]/30",
    sage: "bg-[#7a8a5e]/15 text-[#7a8a5e] border-[#7a8a5e]/30",
    outline: "bg-transparent text-[#6b635c] border-[#201e1d]/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
