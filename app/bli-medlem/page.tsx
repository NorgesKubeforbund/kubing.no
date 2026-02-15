import BlueLink from "../ui/blue-link";
import Title from "../ui/title";

function BliMedlem() {
  return (
    <div className="flex flex-col text-center max-w-5xl px-8 gap-4">
      <Title>Bli Medlem</Title>
      <p>
        Medlemskap i Norges kubeforbund koster 100 kroner i året. Ved å bli medlem støtter
        du arbeidet vårt slik at vi blant annet kan arrangere flere og større konkurranser.
        Medlem får ofte rabatt på norske konkurranser.
      </p>
      <p>
        For å bli medlem må du gjøre to ting:
      </p>
      <div className="flex flex-col gap-2 bg-[#CCCCCC] rounded-2xl p-2.5">
        <div className="font-semibold">Steg 1</div>
        <p>
          For de med Vipps: betal 100 kroner til 24441 og merk meldingen med navn.
        </p>
        <p>
          For de uten Vipps: overfør 100 kroner til kontonummer 1503.13.61831.
        </p>
      </div>
      <div className="flex flex-col gap-2 bg-[#CCCCCC] rounded-2xl p-2.5">
        <div className="font-semibold">Steg 2</div>
        <p>
          Fyll ut <BlueLink
            href="https://docs.google.com/forms/d/e/1FAIpQLSdj4MXBIQWHjsECp_gma4rRzp4MfDfDtohsfU-wDVW-dsY9qA/viewform?usp=header"
          >
            registreringsskjemaet
          </BlueLink> via google, og last opp et skjermbilde av betaling.
        </p>
      </div>
      <p>
        Om du er usikker på om du allerede er medlem, kan du sende mail til <BlueLink href="mailto:medlem@kubing.no">medlem@kubing.no</BlueLink> og spørre.
      </p>
    </div>
  );
}

export default BliMedlem;
