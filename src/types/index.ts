export interface Rap {
  from: string;
  to: string;
  necessaryTime: number;
  fromTo: string;
}

export interface Station {
  name: string;
  shouldRecordTime: boolean;
}

export interface StationList {
  stations: Station[];
  startingStationName: string;
  endingStationName: string;
}

export interface NecessaryTime {
  id: string;
  from: string;
  to: string;
  necessaryTime: number;
}

export type NecessaryTimeMap = Map<String, NecessaryTime>;

export interface TrainType {
  id: number;
  name: string;
  necessaryTimesA: NecessaryTimeMap;
  necessaryTimesB: NecessaryTimeMap;
  stoppingStationList: string[];
  trainIdList: number[];
  lineColor: string;
}

export interface TerminalStation {
  startingStationName: string;
  endingStationName: string;
}
