import { cn } from "@/lib/utils";

const toneMap = {
  orange: "badge-orange",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
} as const;

export function Badge({
  children,
  tone = "orange",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneMap;
  className?: string;
}) {
  return <span className={cn("badge", toneMap[tone], className)}>{children}</span>;
}
