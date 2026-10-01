import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "alert";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tone === "alert"
          ? "border-foreground text-foreground"
          : "border-border bg-subtle text-muted",
      )}
    >
      {children}
    </span>
  );
}
