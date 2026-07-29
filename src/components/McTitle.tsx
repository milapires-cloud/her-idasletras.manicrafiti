export default function McTitle({
  children,
  size = "lg",
}: {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const s = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl",
  }[size];
  return <h1 className={`mc-title ${s} font-bold`}>{children}</h1>;
}
