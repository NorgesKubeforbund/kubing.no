import BlueLink from "@/components/ui/blue-link";
import { Url } from "@/types";
import { ArrowLeft } from "lucide-react";

export default function BackArrow({ href }: { href: Url }) {
  return (
    <div className="self-start">
      <BlueLink
        href={href}
        className="flex flex-row gap-2 items-center"
      >
        <ArrowLeft size={16} />
        <div>Tilbake</div>
      </BlueLink>
    </div>
  );
}
