import Link from "next/link";
import { Url } from "@/types";
import { ReactNode } from "react";

function BlueLink({ href, children }: { href: Url, children?: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-link-text font-semibold active:underline hover:underline"
    >
      {children}
    </Link>
  )
}

export default BlueLink;
