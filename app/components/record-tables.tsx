"use client"

import { ReactNode, useState } from "react";

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
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center">
          <button
            className={`bg-gray-100 hover:bg-gray-300 cursor-pointer border rounded-md px-2 py-1 w-fit ${selected === "wca" && "ring-2 ring-blue-400"}`}
            onClick={() => setSelected("wca")}
          >
            Offisielle Rekorder
          </button>
          <button
            className={`bg-gray-100 hover:bg-gray-300 cursor-pointer border rounded-md px-2 py-1 w-fit ${selected === "unofficial" && "ring-2 ring-blue-400"}`}
            onClick={() => setSelected("unofficial")}
          >
            Uoffisielle Rekorder
          </button>
          <button
            className={`bg-gray-100 hover:bg-gray-300 cursor-pointer border rounded-md px-2 py-1 w-fit ${selected === "non-wca" && "ring-2 ring-blue-400"}`}
            onClick={() => setSelected("non-wca")}
          >
            Ikke-WCA Rekorder
          </button>
        </div>
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
