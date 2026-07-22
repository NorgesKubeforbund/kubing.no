"use client"

import { ReactNode, useRef } from "react";

function EasterEgg({ children }: { children?: ReactNode}) {
  const i = useRef(0)
  const easterEgg = (): void => {
      i.current++;
      if (i.current > 10) {
          alert("Lars Johan er den kuleste av dem ;)");
      }
  }

  return (
    <div onClick={easterEgg}>
      {children}
    </div>
  );
}

export default EasterEgg;
