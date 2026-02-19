import Link from "next/link";

const links: { href: string, text: string }[] = [
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
  {
    href: "/om-oss#kontakt-oss",
    text: "Kontakt oss"
  },
];

function Footer() {
  return (
    <footer className="bg-background-secondary flex flex-row text-white justify-center p-4">
      <div className="flex flex-col md:flex-row gap-2 md:gap-12 text-center justify-between">
        {links.map((link) => (
          <Link
            href={link.href}
            key={link.text}
            className="hover:text-accent-text"
          >
            {link.text}
          </Link>))}
      </div>
    </footer>
  )
}

export default Footer
