import BlueLink from "@/app/ui/blue-link";
import Title from "@/app/ui/title";

const localEvents: { county: string, events: { name: string, link: string, text: string }[] }[] =
  [
    {
      county: "Oslo-Viken", events: [
        {
          name: "Cube Drammen",
          link: "https://www.facebook.com/groups/529099402302831/",
          text: "har tilbud i Drammen.",
        },
        {
          name: "Kubing i Bærum",
          link: "https://www.facebook.com/groups/2430272227122282/",
          text: "har tilbud i Bærum.",
        },
        {
          name: "Romerike SpeedCubers",
          link: "https://spond.com/landing/group/TSRZF",
          text: "har tilbud i Lillestrøm.",
        },
      ]
    },
    {
      county: "Rogaland",
      events: [
        {
          name: "Sandnes SpeedCubers",
          link: "https://www.facebook.com/groups/1658988921015490",
          text: "har tilbud i Sandnes.",
        }
      ]
    },
    {
      county: "Trøndelag",
      events: [
        {
          name: "Nidaros Kubing",
          link: "https://itrondheim.org/forening?id=370343",
          text: "har tilbud på Flatåsen i Trondheim.",
        },
        {
          name: "NTNUI Speedcubing",
          link: "https://www.facebook.com/NTNUISpeedcubing",
          text: "har tilbud for studenter ved NTNU i Trondheim.",
        },
      ],
    },
    {
      county: "Vestland",
      events: [
        {
          name: "Bergen Speedcubing",
          link: "https://www.facebook.com/groups/773142427894936",
          text: "har tilbud i Bergen.",
        },
      ],
    },
  ];

function LocalEvents() {
  return (
    <div className="flex flex-col px-8 max-w-5xl text-center gap-8">
      <div className="flex flex-col gap-4">
        <Title>Lokale Arrangement</Title>
        <p>
          Ønsker du å finne andre kubere å løse sammen med?
          Det finnes flere lokale arragement rundt omkring i landet som møtes jevnlig for å kube sammen.
          Mange av de største byene har tilbud, men du kan også spørre på
          facebook-siden <BlueLink
            href="https://www.facebook.com/groups/NorskeSpeedcubers">
            Norske SpeedCubers
          </BlueLink> om det er noen kubere i nærheten av deg.
          Kanskje du kan bidra til å skape et tilbud for ditt lokalmiljø?
        </p>
      </div>
      {localEvents.map((localEventCounty) =>
        <div className="flex flex-col gap-2" key={localEventCounty.county}>
          <div className="text-2xl font-semibold">{localEventCounty.county}</div>
          {localEventCounty.events.map((localEvent) =>
            <p key={localEvent.name}>
              <BlueLink
                href={localEvent.link}
              >
                {localEvent.name}
              </BlueLink> {localEvent.text}
            </p>
          )}
        </div>
      )}
    </div>
  )
}


export default LocalEvents;
