import Link from "next/link";
import PastComps from "../components/past-comps";
import UpcomingComps from "../components/upcoming-comps";
import Title from "../ui/title";
import EasterEgg from "../components/easter-egg";
import BlueLink from "../ui/blue-link";

const delegates: { area: string, delegates: { name: string, mail: string, wcaId: string }[] }[] = [
  {
    area: "Oslo",
    delegates: [
      { name: "Ulrik Bredland", mail: "ubredland@worldcubeassociation.org", wcaId: "2012BRED01" },
      { name: "Vidar Klungre", mail: "vklungre@worldcubeassociation.org", wcaId: "2008KLUN01" },
      { name: "Jakob Jernsletten", mail: "jjernsletten@worldcubeassociation.org", wcaId: "2018JERN01" },
    ],
  },
  {
    area: "Trondheim",
    delegates: [
      { name: "Jacob Oliver Bruun", mail: "jbruun@worldcubeassociation.org", wcaId: "2018BRUU01" },
      { name: "Lars Johan Folde", mail: "lfolde@worldcubeassociation.org", wcaId: "2018FOLD01" },
    ],
  },
  {
    area: "Bergen",
    delegates: [
      { name: "Lars Ulveseth", mail: "lulveseth@worldcubeassociation.org", wcaId: "2018ULVE01" },
    ],
  },
  {
    area: "USA",
    delegates: [
      { name: "Elmer Alexander Johnsen", mail: "ejohnsen@worldcubeassociation.org", wcaId: "2018JOHN03" },
    ],
  },
];

function Delegates() {
  return (
    <div className="flex flex-col text-center gap-4">
      <Title><EasterEgg>Norske delegater</EasterEgg></Title>
      {delegates.map((delegateArea) =>
        <div className="flex flex-col" key={delegateArea.area}>
          <BlueLink
            href={`mailto:${delegateArea.delegates.map((delegate) => delegate.mail).join(",")}`}
          >
            Delegater i {delegateArea.area} - Kontakt
          </BlueLink>
          {delegateArea.delegates.map((delegate) =>
            <Link
              className="hover:underline"
              href={`https://www.worldcubeassociation.org/persons/${delegate.wcaId}`}
              key={delegate.wcaId}
            >
              {delegate.name}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function ArrangeComp() {
  return (
    <div className="flex flex-row justify-center">
      <div className="flex flex-col max-w-5xl gap-4">
        <div id="arrangereKonkurranse">
          <div className="text-center">
            <Title>Arrangere konkurranse</Title>
          </div>
          <p>
            Det er mye en burde tenke gjennom før en velger å arrangere sin egen
            konkurranse. Først vil vi anbefale å være på noen konkurranser selv,
            slik at du vet hvordan de gjennomføres. WCA har mange ressurser som kan
            hjelpe til med å arrangere konkurranser. Disse kan du finne via lenken
            under.
          </p>
          <div className="flex flex-row justify-center py-4">
            <BlueLink
              href="https://www.worldcubeassociation.org/organizer-guidelines"
            >
              Organizer-Guidelines from WCA
            </BlueLink>
          </div>
          <p>
            Etter at du har skaffet deg et overblikk over hvordan en arrangerer en
            konkurranse og laget en plan for hvordan du ønsker å gjennomføre din
            konkurranse, må du ta kontakt med en delegat. Alle norske delegater er
            listet nedenfor.
          </p>
        </div>
        <Delegates />
      </div>
    </div>
  );
}

function Competitions() {
  return (
    <div className="flex flex-col gap-8 px-8">
      <UpcomingComps />
      <PastComps />
      <ArrangeComp />
    </div>
  )
}

export default Competitions;
