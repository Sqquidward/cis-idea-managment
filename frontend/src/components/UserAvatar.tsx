import { cn, getInitials } from "../lib/utils";

const SIZE_CLASS = {
  sm: "h-9 w-9 text-xl",
  md: "h-11 w-11 text-2xl",
  lg: "h-14 w-14 text-3xl",
} as const;

interface UserAvatarProps {
  emoji?: string | null;
  name: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

export function UserAvatar({ emoji, name, size = "sm", className }: UserAvatarProps) {
  const sizeClass = SIZE_CLASS[size];

  if (emoji) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-indigo-50 ring-1 ring-indigo-100",
          sizeClass,
          className,
        )}
        aria-hidden
      >
        <span className="leading-none">{emoji}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base",
        sizeClass,
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
