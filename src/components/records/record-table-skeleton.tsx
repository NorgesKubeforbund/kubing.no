export default function RecordTableSkeleton() {
  const skeletonRows = Array.from({ length: 20 });

  return (
    <table className="w-full border-collapse">
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
        {skeletonRows.map((_, index) => (
          <tr
            key={index}
            className={`${index % 2 === 0 ? "bg-table-odd" : "bg-table-even"} animate-pulse`}
          >
            <td className="h-6 w-52 sm:h-9 md:h-11"></td>
            <td className="h-6 w-32 sm:h-9 md:h-11"></td>
            <td className="h-6 w-72 sm:h-9 md:h-11"></td>
            <td className="h-6 w-32 sm:h-9 md:h-11"></td>
            <td className="h-6 w-72 sm:h-9 md:h-11"></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
