import BlueLink from "@/components/ui/blue-link";
import Title from "@/components/ui/title";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col max-w-5xl px-4 sm:px-8 text-center gap-8">
      <div className="flex flex-col gap-4">
        <Title>Personvernerklæring</Title>
        <p>
          Dette er en personvernerklæring for Norges Kubeforbund sin
          hjemmeside og gjelder for <BlueLink href="/">kubing.no</BlueLink>.
          Nettsiden styres av Norges Kubeforbund og alle spørsmål angående
          nettsiden kan sendes inn <BlueLink href="/om-oss#kontakt-oss">her</BlueLink>.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Title small>Personopplysninger som samles inn</Title>
        <p>
          Vi samler kun inn personopplysninger hvis du velger å lage en bruker,
          ellers samler vi ikke inn informasjon om deg. Det som samles inn er:
        </p>
        <div className="flex flex-col gap-1">
          <div>
            Navn
          </div>
          <div>
            Epost
          </div>
          <div>
            Fødselsdato
          </div>
          <div>
            Adresse
          </div>
          <div>
            WCA ID
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Title small>Bruksområder av personopplysninger</Title>
        <p>
          Personopplysningene samles inn for å deles med <BlueLink href="https://n4f.no/">Hyperion</BlueLink>.
          Hyperion gir oss støtte for hvert medlem under 26 år som har adresse i Norge.
          Har du ikke adresse i Norge eller er 26 år eller eldre, vil vi ikke dele personopplysningene dine
          med Hyperion. Vi deler ikke data med andre tredjeparter enn Hyperion.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Title small>Informasjonskapsler</Title>
        <p>
          Informasjonskapsler brukes kun for å knytte økten din opp mot brukeren din.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Title small>Dine rettigheter</Title>
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-semibold">Rett til innsyn</div>
          <p>
            Hvis du ønsker innsyn i hva av dine personlige opplysninger som er lagret, kan du se det <BlueLink href="/min-side/innstillinger">her</BlueLink>.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-semibold">Rett til korrigering</div>
          <p>
            Hvis du har endret navn eller epost hos WCA, kan du oppdatere det <BlueLink href="/min-side/innstillinger">her</BlueLink>.
          </p>
        </div>
        {/* <div className="flex flex-col gap-2">
          <div className="text-2xl font-semibold">Rett til begrensning</div>
          <p>
          </p>
        </div> */}
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-semibold">Rett til sletting</div>
          <p>
            Hvis du ønsker å slette brukeren din, ta 
            kontakt <BlueLink href="/om-oss#kontakt-oss">her</BlueLink>.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-semibold">Rett til å klage</div>
          <p>
            Hvis du mener dine personlige opplysninger blir behandlet feil,
            kan du klage <BlueLink href="/om-oss#kontakt-oss">her</BlueLink>.
          </p>
        </div>
      </div>
    </div>
  );
}
