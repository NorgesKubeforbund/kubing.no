"use client"

import Link from "next/link";
import Image from "next/image";
import logo from "@/public/NKF_Logo_trans.png"
import { useState } from "react";
import { usePathname } from "next/navigation";

export type PagePath = { name: string, path: string };

const pages: PagePath[] = [
  { name: "Hjem", path: "/" },
  { name: "Konkurranser", path: "/konkurranser" },
  { name: "Ressurser", path: "/ressurser" },
  { name: "Norske Rekorder", path: "/rekorder" },
  { name: "Bli Medlem", path: "/bli-medlem" },
  { name: "Om Oss", path: "/om-oss" },
];

function Header() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();

  return (
    <header className="flex flex-col lg:flex-row justify-between h-auto p-4 bg-background-secondary text-white">
      <div className="flex flex-row justify-between">
        <Link
          href="/"
          className="flex flex-row h-32 min-[450px]:h-40"
          onClick={() => setIsOpen(false)}
        >
          <Image
            src={logo}
            alt="Norges Kubeforbund sin logo"
            className="w-auto h-auto"
          />
          <div className="text-2xl min-[450px]:text-3xl hidden min-[375px]:flex flex-col justify-center">
            Norges<br />
            Kubeforbund
          </div>
        </Link>
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer group hover:ring-2 p-1.5 rounded-sm ring-gray-400"
          >
            <div className="space-y-1.5">
              <span className="block w-6 h-0.75 bg-white"></span>
              <span className="block w-6 h-0.75 bg-white"></span>
              <span className="block w-6 h-0.75 bg-white"></span>
            </div>
          </button>
        </div>
      </div>
      <div className={`${isOpen ? "flex" : "hidden"} lg:flex flex-row lg:flex-col justify-center p-4 text-2xl lg:text-[16px]`}>
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          {pages.map((page) =>
            <Link
              key={page.name}
              href={page.path}
              className={`hover:text-accent-text ${page.path.split("/").at(1) === pathname.split("/").at(1) ? "text-accent-text" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {page.name}
            </Link>)}
        </div>
      </div>
    </header>
  )
}

export default Header
