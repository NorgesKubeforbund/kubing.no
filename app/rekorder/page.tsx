import Title from "../ui/title";
import WCATable from "../components/wca-table";
import RecordTables from "../components/record-tables";
import UnofficialWCATable from "../components/unoffical-records-table";
import NonWCATable from "../components/non-wca-table";

function Records() {
  return (
    <div className="flex flex-col max-w-5xl px-4 sm:px-8 text-center gap-8">
      <div className="flex flex-col gap-4">
        <Title>Norske Rekorder</Title>
        <p>
          Her er en liste over rekordene i Norge og hvem som har de.
          Vi har også oversikt over de uoffisielle rekordene som ikke er satt i konkurranse,
          og noen eventer som WCA ikke holder styr på.
        </p>
      </div>
      <div className="flex flex-row justify-center">
        <RecordTables WCATable={<WCATable />} UnofficialRecordsTable={<UnofficialWCATable />} NonWCATable={<NonWCATable />} />
      </div>
    </div>
  )
}

export default Records;
