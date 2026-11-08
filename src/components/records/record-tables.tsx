"use client"

import { ReactNode, useState } from "react";
import Tabs from "@/components/ui/tabs";

type RecordTableType = "wca" | "unofficial" | "non-wca";

function RecordTables({
  WCATable,
  UnofficialRecordsTable,
  NonWCATable
}: {
  WCATable: ReactNode
  UnofficialRecordsTable: ReactNode
  NonWCATable: ReactNode
}) {
  const [selected, setSelected] = useState<RecordTableType>("wca");

  return (
    <div className="flex flex-col gap-4 text-xs sm:text-sm md:text-xl">
      <div className="flex flex-row justify-center">
        <Tabs
          options={[
            { value: "wca", label: "Offisielle rekorder" },
            { value: "unofficial", label: "Uoffisielle rekorder" },
            { value: "non-wca", label: "Ikke-WCA rekorder" },
          ]}
          value={selected}
          onChange={setSelected}
          className="w-full max-w-2xl"
        />
      </div>
      <div className="flex flex-row justify-center">
        <div className="max-w-[75vw] overflow-x-auto">
          {selected === "wca" && WCATable}
          {selected === "unofficial" && UnofficialRecordsTable}
          {selected === "non-wca" && NonWCATable}
        </div>
      </div>
    </div>
  )
}

export default RecordTables;
