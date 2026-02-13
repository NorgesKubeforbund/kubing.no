import React, { useEffect, useState } from 'react';
import { getOfficialRecords, getUnofficialRecords, getNonWcaRecords } from 'src/utils/recordUtils';

interface TableProps {
  data: string[][] | null;
}
const WCATable: React.FC<TableProps> = ({ data }) => (
  data ?
    <div className="recordTable">
      <table className="NRTable">
        <tbody className='tableRow'>
          {data.map((el: string[], index: number) => (
            <tr key={el[0]} className={index === 0 ? "recordRow boldRow" : "recordRow"}>
              {el.map((cell, cellIndex) => (
                <td key={cellIndex} className="Cell">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    :
    <div style={{paddingTop: 8}}>
      Noe gikk galt...
    </div>
);

const UnrWCATable: React.FC<TableProps> = ({ data }) => (
  data ?
    <div className="recordTable">
      <table className="NRTable">
        <tbody>
          {data.map((el: string[], index: number) => (
            <tr key={el[0]} className={index === 0 ? "recordRow boldRow" : "recordRow"}>
              {el.map((cell, cellIndex) => (
                <td key={cellIndex} className="Cell">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    :
    <div style={{paddingTop: 8}}>
      Noe gikk galt...
    </div>
);

const UnrNonWCATable: React.FC<TableProps> = ({ data }) => (
  data ?
    <div className="recordTable">
      <table className="NRTable">
        <tbody>
          {data.map((el: string[], index: number) => (
            <tr key={el[0]} className={index === 0 ? "recordRow boldRow" : "recordRow"}>
              {el.map((cell, cellIndex) => (
                <td key={cellIndex} className="Cell">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    :
    <div style={{paddingTop: 8}}>
      Noe gikk galt...
    </div>
);

type TabName = 'official' | 'unofficial' | 'nonWca';

const RecordsTable: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [officialRecords, setOfficialRecords] = useState<string[][] | null>([]);
  const [unofficialRecords, setUnofficialRecords] = useState<string[][] | null>([]);
  const [nonWcaRecords, setNonWcaRecords] = useState<string[][] | null>([]);
  const [activeTab, setActiveTab] = useState<TabName>('official');
  const cacheDuration = 7 * 24 * 60 * 60 * 1000; // 1 week

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        getOfficialRecords(setLoading, setOfficialRecords, cacheDuration),
        getUnofficialRecords(setLoading, setUnofficialRecords, cacheDuration),
        getNonWcaRecords(setLoading, setNonWcaRecords, cacheDuration),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [cacheDuration]);

  const displayTab = () => {
    switch (activeTab) {
      case 'official':
        return <WCATable data={officialRecords} />;
      case 'unofficial':
        return <UnrWCATable data={unofficialRecords} />;
      case 'nonWca':
        return <UnrNonWCATable data={nonWcaRecords} />;
      default:
        return null;
    }
  };

  const TabButton = ({ tabName, label }: { tabName: TabName; label: string }) => (
    <button
      className={activeTab === tabName ? 'tabLinks Activated' : 'tablinks'}
      onClick={() => setActiveTab(tabName)}
    >
      <h3>{label}</h3>
    </button>
  );

  return (
    <div>
      <div className="tab">
        <TabButton tabName="official" label="Offisielle Rekorder" />
        <TabButton tabName="unofficial" label="Uoffisielle Rekorder" />
        <TabButton tabName="nonWca" label="Ikke-WCA Rekorder" />
      </div>
      {loading ? 'Laster inn...' : displayTab()}
    </div>
  );
};

export default RecordsTable;
