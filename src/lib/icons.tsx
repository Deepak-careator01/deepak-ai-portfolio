import {
  Brain,
  Cloud,
  Code2,
  Database,
  Layers,
  Server,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Cloud,
  Code2,
  Database,
  Layers,
  Server,
  Sparkles,
  Target,
};

export function getLucideIcon(name: string): LucideIcon {
  return iconMap[name] ?? Sparkles;
}
