import Title from "@/components/ui/title";
import WCATable from "@/components/records/wca-table";
import RecordTables from "@/components/records/record-tables";
import UnofficialWCATable from "@/components/records/unoffical-records-table";
import NonWCATable from "@/components/records/non-wca-table";
import { Suspense } from "react";
import RecordTableSkeleton from "@/components/records/record-table-skeleton";

function Records() {
  return (
    <div className="flex flex-col max-w-5xl px-4 sm:px-8 text-center gap-8">
      <div className="flex flex-col gap-4">
        <Title>Norske rekorder</Title>
        <p>
          Her er en liste over rekordene i Norge og hvem som har de.
          Vi har også oversikt over de uoffisielle rekordene som ikke er satt i konkurranse,
          og noen eventer som WCA ikke holder styr på.
        </p>
      </div>
      <div className="flex flex-row justify-center">
        <RecordTables
          WCATable={<Suspense fallback={<RecordTableSkeleton />}><WCATable /></Suspense>}
          UnofficialRecordsTable={<Suspense fallback={<RecordTableSkeleton />}><UnofficialWCATable /></Suspense>}
          NonWCATable={<Suspense fallback={<RecordTableSkeleton />}><NonWCATable /></Suspense>} />
      </div>
    </div>
  )
}

export default Records;
