import { cn } from "@/shared/shadcn/lib/utils";
import type { ReactNode } from "react";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps {
  level: HeadingLevel;
  children: ReactNode;
  className?: string;
}

const headingStyles: Record<HeadingLevel, string> = {
  h1: "text-xl font-bold leading-tight sm:text-2xl md:text-3xl",
  h2: "text-lg font-semibold leading-tight sm:text-xl md:text-2xl",
  h3: "text-base font-semibold leading-tight sm:text-lg md:text-xl",
  h4: "text-sm font-semibold leading-snug sm:text-base md:text-lg",
  h5: "text-xs font-semibold leading-snug sm:text-sm md:text-base",
  h6: "text-xs font-semibold leading-snug sm:text-sm",
};

export function Heading({ level, children, className }: HeadingProps) {
  const Component = level;
  const baseStyles = headingStyles[level];

  return <Component className={cn(baseStyles, className)}>{children}</Component>;
}
