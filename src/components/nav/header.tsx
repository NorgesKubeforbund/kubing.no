"use client"

import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/NKF_Logo_trans.png"
import { Ref, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { resourceLinks } from "@/app/ressurser/page";
import { useRouter } from "next/navigation";

export type PagePath = { name: string, path: string };

const leftPages: PagePath[] = [
  { name: "Hjem", path: "/" },
  { name: "Konkurranser", path: "/konkurranser" },
];

const rightPages: PagePath[] = [
  { name: "Norske rekorder", path: "/rekorder" },
];

function HeaderLink({
  className,
  page,
  onClick,
  pathname,
  isResourcesOpen,
}: {
  className?: string
  page: PagePath
  onClick: () => void
  pathname: string
  isResourcesOpen: boolean
}) {
  return (
    <Link
      href={page.path}
      className={`${className ?? ""} font-semibold active:text-accent-text hover:text-accent-text ${page.path === pathname && !isResourcesOpen ? "text-accent-text" : ""}`}
      onClick={onClick}
    >
      {page.name}
    </Link>
  )
}

function ResourcesDropdown({
  resourcesButtonRef,
  popoverRef,
  isResourcesOpen,
  setIsResourcesOpen,
  setIsOpen,
  pathname,
}: {
  resourcesButtonRef: Ref<HTMLButtonElement | null>
  popoverRef: Ref<HTMLDivElement | null>
  setIsResourcesOpen: (value: boolean) => void
  setIsOpen: (value: boolean) => void
  isResourcesOpen: boolean
  pathname: string
}) {
  return (
    <div className="relative inline-block">
      <button
        ref={resourcesButtonRef}
        className={`font-semibold active:text-accent-text hover:text-accent-text cursor-pointer text-left ${"ressurser" === pathname.split("/").at(1) || isResourcesOpen
          ? "text-accent-text"
          : ""
          }`}
        onClick={() => setIsResourcesOpen(!isResourcesOpen)}
      >
        Ressurser
      </button>
      {isResourcesOpen && (
        <div ref={popoverRef} className="absolute left-1/2 -translate-x-1/2 translate-y-4 w-72 lg:w-48 rounded-xl bg-background-secondary border-4 lg:border-2 border-white p-4 z-50 shadow-md">
          <div className="flex flex-col gap-2 text-center">
            {resourceLinks.map((page) =>
              <HeaderLink
                page={page} key={page.name}
                onClick={() => {
                  setIsOpen(false);
                  setIsResourcesOpen(false);
                }}
                pathname={pathname}
                isResourcesOpen={false}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function LoginButton({
  loggedIn,
  isResourcesOpen,
  pathname,
  onClick,
  onLogout,
}: {
  loggedIn: boolean
  isResourcesOpen: boolean
  pathname: string
  onClick: () => void
  onLogout: () => void
}) {
  const router = useRouter();
  async function handleLogin() {
    if (!loggedIn) {
      router.push("/login");
      onClick();
    } else {
      await fetch("/api/auth/logout", {
        method: "POST"
      });
      onClick();
      onLogout();
      router.push("/");
    }
  }
  return (
    <div className="relative inline-block">
      <button
        className={`font-semibold hover:text-accent-text cursor-pointer text-left ${"login" === pathname.split("/").at(1) && !isResourcesOpen ? "text-accent-text" : ""}`}
        onClick={handleLogin}
      >
        {loggedIn ? "Logg ut" : "Logg inn"}
      </button>
    </div>
  )
}

function Header({ 
  initialIsLoggedIn,
}: {
  initialIsLoggedIn: boolean;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialIsLoggedIn);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const resourcesButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && (resourcesButtonRef.current !== event.target)) {
        setIsResourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeHeader = () => {
    setIsOpen(false)
    setIsResourcesOpen(false)
  };

  async function refreshSession() {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      signal: AbortSignal.timeout(30 * 1000),
    });
    const { isLoggedIn } = await res.json();
    setIsLoggedIn(isLoggedIn);
  }

  useEffect(() => {
    const interval = setInterval(refreshSession, 90 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex flex-col lg:flex-row justify-between h-auto p-4 bg-background-secondary text-white">
      <div className="flex flex-row justify-between">
        <Link
          href="/"
          className="flex flex-row h-32 min-[450px]:h-40"
          onClick={() => setIsOpen(false)}
        >
          <Image
            loading="eager"
            src={logo}
            alt="Norges Kubeforbund sin logo"
            className="w-auto h-auto"
          />
          <div className="font-bold text-2xl min-[450px]:text-3xl hidden min-[375px]:flex flex-col justify-center">
            Norges<br />
            Kubeforbund
          </div>
        </Link>
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => {
              setIsOpen(!isOpen)
              if (isOpen) {
                setIsResourcesOpen(false)
              }
            }}
            className="cursor-pointer group active:ring-2 hover:ring-2 p-1.5 rounded-sm ring-neutral-400"
          >
            <div className="space-y-1.5">
              <span className="block w-6 h-0.75 bg-white"></span>
              <span className="block w-6 h-0.75 bg-white"></span>
              <span className="block w-6 h-0.75 bg-white"></span>
            </div>
          </button>
        </div>
      </div>
      <div className={`${isOpen ? "flex" : "hidden"} lg:flex flex-row lg:flex-col justify-center p-3 text-2xl lg:text-[16px]`}>
        <div className="flex flex-col lg:flex-row justify-between gap-5">
          {leftPages.map((page) =>
            <HeaderLink page={page} key={page.name} onClick={closeHeader} pathname={pathname} isResourcesOpen={isResourcesOpen} />
          )}
          {rightPages.map((page) =>
            <HeaderLink className="flex lg:hidden" key={page.name} page={page} onClick={closeHeader} pathname={pathname} isResourcesOpen={isResourcesOpen} />
          )}
          <ResourcesDropdown
            resourcesButtonRef={resourcesButtonRef}
            popoverRef={popoverRef}
            isResourcesOpen={isResourcesOpen}
            setIsResourcesOpen={setIsResourcesOpen}
            setIsOpen={setIsOpen}
            pathname={pathname}
          />
          {rightPages.map((page) =>
            <HeaderLink className="hidden lg:flex" key={page.name} page={page} onClick={closeHeader} pathname={pathname} isResourcesOpen={isResourcesOpen} />
          )}
          {isLoggedIn && <HeaderLink page={{ name: "Min side", path: "/min-side" }} onClick={closeHeader} pathname={pathname} isResourcesOpen={isResourcesOpen} />}
          <LoginButton loggedIn={isLoggedIn} pathname={pathname} isResourcesOpen={isResourcesOpen} onClick={closeHeader} onLogout={() => setIsLoggedIn(false)} />
        </div>
      </div>
    </header>
  )
}

export default Header
