export function cn(...inputs: Array<string | undefined>) {
  return inputs.filter(Boolean).join(" ");
}