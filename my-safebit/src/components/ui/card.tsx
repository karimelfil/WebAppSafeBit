import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("rounded-xl border bg-white p-6 shadow-sm", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h2 className={cn("text-xl font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-gray-600", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("space-y-4", className)} {...props} />;
}