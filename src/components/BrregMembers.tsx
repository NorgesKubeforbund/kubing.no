// BrregMembers.tsx
import React, { useState, useEffect } from 'react';
import { brregResponse } from 'src/types';
import { getBrregData } from '../utils/brregUtils'; // Adjust the import as necessary

const BrregMembers: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [brregData, setBrregData] = useState<brregResponse[]>([]);
  const cacheDuration = 7 * 24 * 60 * 60 * 1000; // 1 week

  useEffect(() => {
    getBrregData(setLoading, setBrregData, cacheDuration);
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="styreTable">
          <thead>
            <tr>
              <th>Navn:</th>
              <th>Stilling:</th>
            </tr>
          </thead>
          <tbody>
            {brregData.map((el: brregResponse) => {
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
      )}
    </div>
  );
};

export default BrregMembers;