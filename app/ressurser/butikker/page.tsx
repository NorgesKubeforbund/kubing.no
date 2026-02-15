import BlueLink from "@/app/ui/blue-link";
import Title from "@/app/ui/title";

const stores: { name: string, link: string, description: string }[] = [
  { name: "Cuboss", link: "https://cuboss.com", description: "Cuboss er en kubebutikk lokalisert i Sverige. De har et bra utvalg og kort leveringstid." },
  { name: "Nordicube", link: "https://nordicube.no", description: "Nordicube er den eldste norske kubebutikken. De har kort leveringstid og ingen importkostnader." },
  { name: "SpeedCubeShop", link: "https://speedcubeshop.com", description: "SpeedCubeShop er en kubebutikk lokalisert i USA. De har et stort utvalg, men kan ha noe lang leveringstid siden kubene kommer fra USA." },
  { name: "The Cubicle", link: "https://www.thecubicle.com/en-no", description: "The Cubicle er en kubebutikk lokalisert i USA. De har et stort utvalg, men også lengre leveringstid siden kubene sendes fra USA." },
];

function Stores() {
  return (
    <div className="flex flex-col gap-8 text-center px-8 max-w-5xl">
      <div className="flex flex-col gap-4">
        <Title>Butikker</Title>
        <p>
          Mange lurer på hvor de kan få tak i kuber. Her er en liste med
          forskjellige kubebutikker som vi har god erfaring med.
        </p>
      </div>
      {stores.map((store) =>
        <div
          className="flex flex-col gap-4"
          key={store.name}
        >
          <div className="text-2xl">
            <BlueLink href={store.link}>
              {store.name}
            </BlueLink>
          </div>
          <p>{store.description}</p>
        </div>
      )}
    </div>
  )
}

export default Stores;
