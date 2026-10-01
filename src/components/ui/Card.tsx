import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

export function Card({
  children,
  className,
  orange = false,
}: PropsWithChildren<{ className?: string; orange?: boolean }>) {
  return <div className={cn(orange ? "card-orange" : "card", "p-5 md:p-6", className)}>{children}</div>;
}
