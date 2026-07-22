import BlueLink from "@/app/ui/blue-link";
import Title from "@/app/ui/title"

const links: { name: string, link: string, description: string }[] = [
  { name: "WCA", link: "https://www.worldcubeassociation.org", description: "WCA (World Cube Association) sine hjemmesider inneholder resultater og informasjon om alle offisielle konkurranser i hele verden. Du kan også finne profilen til alle som har deltatt på konkurranser." },
  { name: "WCA Live", link: "https://live.worldcubeassociation.org", description: "WCA Live viser resultater fra pågående konkurranser. Om du deltar på en konkurranse kan du bruke denne siden for å få oversikt om du har gått videre eller ikke." },
  { name: "Norske Speedcubers på Facebook", link: "https://www.facebook.com/groups/NorskeSpeedcubers", description: "Norske Speedcubers er den offisielle Facebook-siden for det norske kubemiljøet. Her kan du få kontakt med en stor del av kubemiljøet." },
  { name: "NKF på YouTube", link: "https://www.youtube.com/@norgeskubeforbund3156", description: "NKF er også på YouTube. Her legges det stadig vekk ut videoer." },
  { name: "NKF på Discord", link: "https://discord.gg/6y6s8vB3Z4", description: "NKF er også på Discord. Her kan du få kontakt med en stor del av kubemiljøet." },
];

function Links() {
  return (
    <div className="flex flex-col gap-8 text-center p-8 max-w-5xl">
      <Title>Lenker</Title>
      {links.map((link) =>
        <div
          className="flex flex-col gap-4"
          key={link.name}
        >
          <div className="text-2xl">
            <BlueLink href={link.link}>
              {link.name}
            </BlueLink>
          </div>
          <p>{link.description}</p>
        </div>
      )}
    </div>
  )
}

export default Links
