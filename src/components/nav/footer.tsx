import Link from "next/link";

const internalLinks: { href: string, text: string }[] = [
  {
    href: "/om-oss",
    text: "Om oss"
  },
  {
    href: "/om-oss#kontakt-oss",
    text: "Kontakt oss"
  },
  {
    href: "/personvern",
    text: "Personvernerklæring"
  },
  {
    href: "/NKF-medlem-salgskontrakt.pdf",
    text: "Salgsavtale"
  },
];

const externalLinks: { href: string, text: string }[] = [
  {
    href: "https://www.facebook.com/profile.php?id=61556336000104",
    text: "Facebook"
  },
  {
    href: "https://www.youtube.com/@norgeskubeforbund3156",
    text: "YouTube"
  },
  {
    href: "https://github.com/NorgesKubeforbund/kubing.no",
    text: "GitHub"
  },
  {
    href: "https://w2.brreg.no/enhet/sok/detalj.jsp?orgnr=994663666",
    text: "Om organisasjonen"
  },
];

function Footer() {
  return (
    <footer className="bg-background-secondary flex flex-row text-white justify-center p-8">
      <div className="flex flex-col md:flex-row gap-8 md:gap-50 text-left justify-between">
        <div className="flex flex-col gap-2">
          {internalLinks.map((link) => (
            <Link
              href={link.href}
              key={link.text}
              className="font-semibold active:text-accent-text hover:text-accent-text"
            >
              {link.text}
            </Link>))}
        </div>
        <div className="flex flex-col gap-2">
          {externalLinks.map((link) => (
            <Link
              href={link.href}
              key={link.text}
              className="font-semibold active:text-accent-text hover:text-accent-text"
            >
              {link.text}
            </Link>))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
