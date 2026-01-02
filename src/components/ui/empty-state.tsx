import { cn } from "@/lib/utils";
import { FileQuestion, Search, Inbox, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "search" | "inbox" | "error";
  className?: string;
}

const variantIcons = {
  default: FileQuestion,
  search: Search,
  inbox: Inbox,
  error: AlertCircle,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const Icon = icon ? null : variantIcons[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        {icon || (Icon && <Icon className="h-8 w-8 text-muted-foreground" />)}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
