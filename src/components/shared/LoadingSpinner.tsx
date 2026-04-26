import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  fullPage = false,
}: {
  className?: string;
  fullPage?: boolean;
}) {
  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className={cn("h-8 w-8 animate-spin text-primary", className)} />
      </div>
    );
  }
  return <Loader2 className={cn("h-5 w-5 animate-spin text-primary", className)} />;
}
