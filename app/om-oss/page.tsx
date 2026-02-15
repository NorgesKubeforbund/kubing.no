import BoardMembers from "../components/board-members";
import ContactForm from "../components/contact-form";
import BlueLink from "../ui/blue-link";
import Title from "../ui/title";

function Introduction() {
  return (
    <div className="flex flex-col gap-4">
      <Title>Om Oss</Title>
      <p>
        Norges kubeforbund jobber med å fremme interessen for løsing av Rubiks
        kube og andre lignende puslespill i Norge. Dette gjøres ved å
        arrangere konkurranser og bidra til å skape et sosialt miljø. Om du
        synes dette høres spennende ut, kan du bli medlem eller finne et
        lokalt miljø å bli kjent med. Du kan medlem deg inn{" "}
        <BlueLink href="/bli-medlem">her</BlueLink> og finne en oversikt over lokale
        kubemiljø <BlueLink href="/ressurser/lokale-arrangement">her</BlueLink>.
      </p>
    </div>
  )
}

function AboutUs() {
  return (
    <div className="flex flex-col px-4 sm:px-8 max-w-5xl gap-8 text-center">
      <Introduction />
      <BoardMembers />
      <ContactForm serviceId={"service_onnkkgn"} />
    </div>
  )
}

export default AboutUs;
