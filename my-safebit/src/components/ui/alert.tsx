import { cn } from "../../lib/utils";

export function Alert({ className, ...props }) {
  return (
    <div
      className={cn("rounded-md border p-4 text-sm", className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm", className)} {...props} />
  );
}