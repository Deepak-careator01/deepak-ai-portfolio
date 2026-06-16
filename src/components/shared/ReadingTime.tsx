import { cn } from "@/lib/utils";

type ReadingTimeProps = {
  minutes: number;
  className?: string;
};

export function ReadingTime({ minutes, className }: ReadingTimeProps) {
  return (
    <span className={cn("text-sm text-muted-foreground", className)}>
      {minutes} min read
    </span>
  );
}
