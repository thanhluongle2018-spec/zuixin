import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Alert({
  children,
  tone = "demo",
  title,
  className,
}: {
  children: React.ReactNode;
  tone?: "demo" | "warning" | "info";
  title?: string;
  className?: string;
}) {
  const Icon = tone === "info" ? Info : AlertTriangle;
  return (
    <div
      className={cn(
        "alert",
        tone === "demo" && "alert-demo",
        tone === "warning" && "alert-warning",
        className
      )}
      role="status"
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <div>
          {title ? <div className="mb-1 font-semibold">{title}</div> : null}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
