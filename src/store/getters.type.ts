import { Station, stationId, TerminalStation, TrainType } from "@/types";
import { chartJsData, chartJsDataSet } from "@/types/diagram";
import { State } from ".";

export interface MyGetters {
  getShouldRecordTimeStationList: Station[];
  getTerminalStation: TerminalStation;
  getStation: (key: stationId) => Station | undefined;
  getTrainType: (key: number) => TrainType | undefined;
  getTrainTypeByTrainId: (key: number) => TrainType | undefined;
  getChatrJsData: chartJsData;
  getMinAndMaxTimeOnDiagramData: { min: string; max: string };
  getTrainDiagramDataSetById: (id: number) => chartJsDataSet | undefined;
  getHistoryInfo: { nowIndex: number; length: number };
}

export type MyGettersFunctions = {
  [P in keyof MyGetters]: (state: State, getters: MyGetters) => MyGetters[P];
};
