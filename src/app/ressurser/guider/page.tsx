import DownloadPDFButton from "@/app/components/download-pdf-button";
import BlueLink from "@/app/ui/blue-link";
import Title from "@/app/ui/title";

function Guides() {
  return (
    <div className="flex flex-col gap-8 px-8 text-center max-w-5xl">
      <div className="flex flex-col gap-4">
        <Title>Guider</Title>
        <p>
          For nybegynnere kan det være vanskelig å lære seg å løse kuben.
          Derfor har vi noen guider som gjør at hvem som helst kan lære seg å løse.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-2xl font-bold">Guide på norsk</div>
        <p>
          <BlueLink href="https://einsan.github.io">
            Denne guiden
          </BlueLink> er skrevet av Ruwix.com,
          oversatt til norsk av Lars Johan Folde, og adaptert av Einar Martin Sandvik.
          Den beskriver en av de enkleste metodene en kan bruke for å løse kuben.
          Metoden består av få, enkle algoritmer som gjøres gjentatte ganger.
          Du kan også laste ned en PDF-versjon av
          guiden <DownloadPDFButton>her</DownloadPDFButton>.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-2xl font-bold">Guide på engelsk</div>
        <p>
          Det finnes flere guider for nybegynnere på engelsk, mange av de er på YouTube. En av de finner 
          du <BlueLink href="https://einsan.github.io">
            her
          </BlueLink>.
        </p>
      </div>
    </div>
  )
}

export default Guides;
