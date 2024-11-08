import "./Konkurranser.css";
import ExternalLink from "../components/ExternalLink";
import UpcomingComps from "src/components/UpcomingComps";
import PastComps from "src/components/PastComps";

function Konkurranser() {
  const arrangereKonkurranse = () => {
    return (
      <div className="delegateList">
        <br></br>
        <br></br>
        <h1 id="arrangereKonkurranse" className="MainHeader">
          Arrangere konkurranse
        </h1>
        Det er mye en burde tenke gjennom før en velger å arrangere sin egen
        konkurranse. Først vil vi anbefale å være på noen konkurranser selv,
        slik at du vet hvordan de gjennomføres. WCA har mange ressurser som kan
        hjelpe til med å arrangere konkurranser. Disse kan du finne via lenken
        under.
        <br></br>
        <br></br>
        <ExternalLink
          className="arrangereLink"
          href="https://www.worldcubeassociation.org/organizer-guidelines"
        >
          Organizer-Guidelines from WCA
        </ExternalLink>
        <br></br>
        <br></br>
        Etter at du har skaffet deg et overblikk over hvordan en arrangerer en
        konkurranse og laget en plan for hvordan du ønsker å gjennomføre din
        konkurranse, må du ta kontakt med en delegat. Alle norske delegater er
        listet nedenfor.
        <br></br>
        <br></br>
        <h2 className="delegateHeader">Norske Delegater</h2>
        <div className="delegateColumn">
          <strong>
            <ExternalLink
              className="delegateContact"
              href="mailto:ubredland@worldcubeassociation.org,vklungre@worldcubeassociation.org,ironmeadow@gmail.com"
            >
              Delegater i Oslo - Kontakt
            </ExternalLink>
          </strong>
          <br></br>
          <br></br>
          <ExternalLink
            className="delegate"
            href="https://www.worldcubeassociation.org/persons/2012BRED01"
          >
            Ulrik Bredland
          </ExternalLink>
          <br></br>
          <ExternalLink
            className="delegate"
            href="https://www.worldcubeassociation.org/persons/2008KLUN01"
          >
            Vidar Klungre
          </ExternalLink>
          <br></br>
          <ExternalLink
            className="delegate"
            href="https://www.worldcubeassociation.org/persons/2018JERN01"
          >
            Jakob Jernsletten
          </ExternalLink>
        </div>
        <div className="delegateColumn">
          <strong>
            <ExternalLink
              className="delegateContact"
              href="mailto:jbruun@worldcubeassociation.org,lfolde@worldcubeassociation.org"
            >
              Delegater i Trondheim - Kontakt
            </ExternalLink>
          </strong>
          <br></br>
          <br></br>
          <ExternalLink
            className="delegate"
            href="https://www.worldcubeassociation.org/persons/2018FOLD01"
          >
            Lars Johan Folde
          </ExternalLink>
          <br></br>
          <ExternalLink
            className="delegate"
            href="https://www.worldcubeassociation.org/persons/2018BRUU01"
          >
            Jacob Oliver Bruun
          </ExternalLink>
        </div>
        <div className="delegateColumn">
          <strong>
            <ExternalLink
              className="delegateContact"
              href="mailto:ejohnsen@worldcubeassociation.org"
            >
              Delegater i Nord Dakota, USA - Kontakt
            </ExternalLink>
          </strong>
          <br></br>
          <br></br>
          <ExternalLink
            className="delegate"
            href="https://www.worldcubeassociation.org/persons/2018JOHN03"
          >
            Elmer Alexander Johnsen
          </ExternalLink>
        </div>
      </div>
    );
  };

  //render
  return (
    <div className="Konkurranser">
      <div className="Main">
        <div>
          <h1 className="MainHeader">Kommende konkurranser</h1>
          <div className="Comps">
          <UpcomingComps/>
          </div>
          <h1 className="MainHeader">Tidligere konkurranser</h1>
          <div className="Comps">
          <PastComps/>
          </div>
        </div>
        {arrangereKonkurranse()}
      </div>
    </div>
  );
}

export default Konkurranser;
