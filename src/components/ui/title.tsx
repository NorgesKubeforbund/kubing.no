export default function Title({ children, small }: { children?: React.ReactNode, small?: boolean }) {
  const className = small
    ? "text-3xl text-black font-semibold"
    : "text-4xl text-accent-text font-bold";
  return (
    <div className={className}>
      {children}
    </div>
  );
}
