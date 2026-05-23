import { type ReactNode } from "react";
import { cn } from "../lib/utils";

interface AnimatedTabContentProps {
  tabKey: string;
  direction: "left" | "right";
  children: ReactNode;
}

export function AnimatedTabContent({ tabKey, direction, children }: AnimatedTabContentProps) {
  return (
    <div
      key={tabKey}
      className={cn(
        direction === "right" ? "animate-tab-enter-right" : "animate-tab-enter-left",
      )}
    >
      {children}
    </div>
  );
}
