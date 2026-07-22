import Title from "@/components/ui/title";
import { getBrregData } from "@/lib/brreg";
import { BrregResponse } from "@/types/responses";

async function BoardMembers() {
  const boardMembers = await getBrregData();
  return (
    <div className="flex flex-col gap-4">
      <Title small>Styret</Title>
      <div className="flex flex-row justify-center">
        <table>
          <thead>
            <tr>
              <th>Navn:</th>
              <th>Stilling:</th>
            </tr>
          </thead>
          <tbody>
            {boardMembers.map((el: BrregResponse, idx: number) =>
              <tr key={idx}>
                <td>
                  {`${el.person.navn.fornavn}${el.person.navn.mellomnavn ? ` ${el.person.navn.mellomnavn} ` : " "}${el.person.navn.etternavn}`}
                </td>
                <td className={el.type.beskrivelse}>{el.type.beskrivelse}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BoardMembers;
