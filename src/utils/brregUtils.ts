import axios from "axios";
import { brregResponse } from "../types";
import { isCacheValid } from "./dateUtils";
import { brregURLs } from "src/config/urls";

export const getBrregData = async (
  setLoading: (loading: boolean) => void,
  setBrregData: (data: brregResponse[]) => void,
  cacheDuration: number
): Promise<void> => {
  setLoading(true);
  const cachedBrregData = localStorage.getItem("brregData");
  const cachedBrregDataTimestamp = localStorage.getItem("brregDataTimestamp");
  if (
    cachedBrregData &&
    cachedBrregDataTimestamp &&
    isCacheValid(cachedBrregDataTimestamp, cacheDuration)
  ) {
    setBrregData(JSON.parse(cachedBrregData));
  } else {
    try {
      const brregResponse = await axios.get(
        brregURLs.STYREMEDLEM
      );
      setBrregData(brregResponse.data.rollegrupper[1].roller);
      localStorage.setItem(
        "brregData",
        JSON.stringify(brregResponse.data.rollegrupper[1].roller)
      );
      localStorage.setItem("brregDataTimestamp", Date.now().toString());
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
