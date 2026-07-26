type Size = "sm" | "md" | "lg";

export function Spinner({ size = "md", className = "" }: { size?: Size; className?: string }) {
  const px = size === "sm" ? "h-4 w-4 border-2" : size === "lg" ? "h-10 w-10 border-4" : "h-6 w-6 border-[3px]";
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-purple-600 border-t-transparent ${px} ${className}`}
    />
  );
}

export default Spinner;
