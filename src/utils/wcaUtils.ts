// utils.ts
import axios from 'axios';
import { compResponse } from '../types';
import { isCacheValid } from './dateUtils';
import { wcaURLs } from 'src/config/urls';

export const getNorwayCompData = async (
  setLoading: (loading: boolean) => void,
  setNorwayCompData: (data: compResponse[]) => void,
  cacheDuration: number
): Promise<void> => {
  setLoading(true);
  const cachedNorwegianCompsData = localStorage.getItem("norwayCompData");
  const cachedNorwegianCompsDataTimestamp = localStorage.getItem("norwayCompDataTimestamp");

  if (
    cachedNorwegianCompsData &&
    cachedNorwegianCompsDataTimestamp &&
    isCacheValid(cachedNorwegianCompsDataTimestamp, cacheDuration)
  ) {
    setNorwayCompData(JSON.parse(cachedNorwegianCompsData));
  } else {
    try {
      const localCompsResponse = await axios.get(
        wcaURLs.NORWEGIAN_COMPETITIONS
      );
      localCompsResponse.data.sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      setNorwayCompData(localCompsResponse.data);
      localStorage.setItem(
        "norwayCompData",
        JSON.stringify(localCompsResponse.data)
      );
      localStorage.setItem("norwayCompDataTimestamp", Date.now().toString());
    } catch (error) {
      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      alert(message);
    }
  }
  setLoading(false);
};