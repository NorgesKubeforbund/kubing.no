import { PagePath } from "@/app/components/header";
import Title from "@/app/ui/title";
import BlueLink from "@/app/ui/blue-link";

export const resourceLinks: PagePath[] = [
  { name: "Butikker", path: "/ressurser/butikker" },
  { name: "Guider", path: "/ressurser/guider" },
  { name: "Lenker", path: "/ressurser/lenker" },
  { name: "Lokale Arrangement", path: "/ressurser/lokale-arrangement" },
];

function Resources() {
  return (
    <div className="flex flex-col gap-8 text-center px-4">
      <div className="flex flex-col gap-4">
        <Title>Ressurser</Title>
        <p>Her finner du lenker til sider med nyttige ressurser.</p>
      </div>
      <div className="flex flex-col gap-4">
        {resourceLinks.map((page) =>
          <div className="text-2xl" key={page.name}>
            <BlueLink href={page.path}>
              {page.name}
            </BlueLink>
          </div>
        )}
      </div>
    </div>
  )
}

export default Resources;
