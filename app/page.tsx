import UpcomingComps from "./components/upcoming-comps";
import Title from "./ui/title";

async function Home() {
  return (
    <div className="flex flex-col lg:flex-row justify-center px-4 sm:px-8 md:px-20 gap-8">
      <div className="flex flex-col text-center lg:text-left gap-8 lg:min-w-[40vw]">
        <div className="flex flex-col gap-4">
          <Title>Norges Kubeforbund</Title>
          <p>
            Velkommen til hjemmesiden til Norges kubeforbund.
            Hvis du ønsker å lære deg å løse Rubiks kube, så har du kommet til riktig sted.
            Vi har guider som beskriver hvordan dette gjøres.
            Hvis du allerede kan løse kuben, og kan tenke deg å delta i konkurranser,
            eller møte andre som driver med konkurransekubing,
            så har du også kommet til riktig sted.
            Her kan du finne informasjon om norske konkurranser og andre arrangementer.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Title>Hva er speedkubing?</Title>
          <p>
            Speedkubing er en sport hvor målet er å løse Rubiks kube og andre liknende puslespill på kortest mulig tid.
            Flere ganger årlig arrangeres det konkurranser i Norge (og i resten av verden),
            hvor deltakerne løser Rubiks kube på tid.
          </p>
        </div>
      </div>
      <div className="lg:min-w-[40vw]">
        <UpcomingComps />
      </div>
    </div>
  );
}

export default Home;
