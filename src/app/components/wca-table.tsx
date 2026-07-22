import { getWCARecords } from "../utils/record-utils";

async function WCATable() {
  const wcaRecords = await getWCARecords();
  return (
    <table>
      <thead>
        <tr>
          <th>Event</th>
          <th>Singel</th>
          <th>Person</th>
          <th>Snitt</th>
          <th>Person</th>
        </tr>
      </thead>
      <tbody>
        {wcaRecords.map((row: string[], index: number) => (
          <tr key={row[0]} className={`${index % 2 === 0 ? "bg-table-odd" : "bg-table-even"}`}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="Cell">{cell !== "" ? cell : "N/A"}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default WCATable;
