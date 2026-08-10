import Link from "next/link";
import { Url } from "@/types";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

function BlueLink({
  href,
  children,
  className,
}: {
  href: Url,
  children?: ReactNode
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-link-text font-semibold active:underline hover:underline",
        className
      )}
    >
      {children}
    </Link>
  )
}

export default BlueLink;
