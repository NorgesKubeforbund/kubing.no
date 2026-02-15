import { getBrregData } from "../utils/brreg-utils";
import { BrregResponse } from "../utils/response-types";

async function BoardMembers() {
  const boardMembers = await getBrregData();
  return (
    <div className="flex flex-col gap-4">
      <div className="text-3xl font-semibold">Styret</div>
      <div className="flex flex-row justify-center">
        <table>
          <thead>
            <tr>
              <th>Navn:</th>
              <th>Stilling:</th>
            </tr>
          </thead>
          <tbody>
            {boardMembers.map((el: BrregResponse) => {
              let mellomNavn = "";
              if (el.person.navn.mellomnavn !== undefined) {
                mellomNavn = el.person.navn.mellomnavn;
              }
              return (
                <tr key={el.person.fodselsdato}>
                  <td className="fornavn">
                    {el.person.navn.fornavn +
                      " " +
                      mellomNavn +
                      " " +
                      el.person.navn.etternavn}
                  </td>
                  <td className={el.type.beskrivelse}>{el.type.beskrivelse}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BoardMembers;
