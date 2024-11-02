import axios from "axios";
import { isCacheValid } from "./dateUtils";

export const getOfficialRecords = async (
  setLoading: (loading: boolean) => void,
  setOfficialRecords: (data: string[][]) => void,
  cacheDuration: number
): Promise<void> => {
  setLoading(true);
  const cachedOfficialRecords = localStorage.getItem("officialRecords");
  const cachedOfficialRecordsTimestamp = localStorage.getItem(
    "officialRecordsTimestamp"
  );
  if (
    cachedOfficialRecords &&
    cachedOfficialRecordsTimestamp &&
    isCacheValid(cachedOfficialRecordsTimestamp, cacheDuration)
  ) {
    setOfficialRecords(JSON.parse(cachedOfficialRecords));
  } else {
    try {
      const recordsResponse = await axios.get(
        `${process.env.REACT_APP_NORSKEREKORDERWCA_KEY}`
      );
      setOfficialRecords(recordsResponse.data.values);
      localStorage.setItem(
        "officialRecords",
        JSON.stringify(recordsResponse.data.values)
      );
      localStorage.setItem("officialRecordsTimestamp", Date.now().toString());
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

export const getUnofficialRecords = async (
  setLoading: (loading: boolean) => void,
  setUnofficialRecords: (data: string[][]) => void,
  cacheDuration: number
): Promise<void> => {
  setLoading(true);
  const cachedUnofficialRecords = localStorage.getItem("unofficialRecords");
  const cachedUnofficialRecordsTimestamp = localStorage.getItem(
    "unofficialRecordsTimestamp"
  );
  if (
    cachedUnofficialRecords &&
    cachedUnofficialRecordsTimestamp &&
    isCacheValid(cachedUnofficialRecordsTimestamp, cacheDuration)
  ) {
    setUnofficialRecords(JSON.parse(cachedUnofficialRecords));
  } else {
    try {
      const recordsResponse = await axios.get(
        `${process.env.REACT_APP_NORSKEREKORDER_KEY}`
      );
      setUnofficialRecords(recordsResponse.data.values);
      localStorage.setItem(
        "unofficialRecords",
        JSON.stringify(recordsResponse.data.values)
      );
      localStorage.setItem("unofficialRecordsTimestamp", Date.now().toString());
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
}

export const getNonWcaRecords = async (
  setLoading: (loading: boolean) => void,
  setNonWcaRecords: (data: string[][]) => void,
  cacheDuration: number
): Promise<void> => {
  setLoading(true);
  const cachedNonWcaRecords = localStorage.getItem("nonWcaRecords");
  const cachedNonWcaRecordsTimestamp = localStorage.getItem(
    "nonWcaRecordsTimestamp"
  );
  if (
    cachedNonWcaRecords &&
    cachedNonWcaRecordsTimestamp &&
    isCacheValid(cachedNonWcaRecordsTimestamp, cacheDuration)
  ) {
    setNonWcaRecords(JSON.parse(cachedNonWcaRecords));
  } else {
    try {
      const recordsResponse = await axios.get(
        `${process.env.REACT_APP_NORSKEREKORDERNONWCA_KEY}`
      );
      setNonWcaRecords(recordsResponse.data.values);
      localStorage.setItem(
        "nonWcaRecords",
        JSON.stringify(recordsResponse.data.values)
      );
      localStorage.setItem("nonWcaRecordsTimestamp", Date.now().toString());
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
}