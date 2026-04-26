import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ErrorMessage({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="my-3">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
