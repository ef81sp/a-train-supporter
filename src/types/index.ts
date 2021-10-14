export interface Rap {
  from: string;
  to: string;
  necessaryTime: number;
  fromTo: string;
}

export type stationId = number;

export interface Station {
  id: stationId;
  name: string;
  shouldRecordTime: boolean;
}

export interface StationList {
  stations: Station[];
  startingStationId: stationId;
  endingStationId: stationId;
}

export interface NecessaryTime {
  id: string;
  from: stationId;
  to: stationId;
  necessaryTime: number;
}

export type NecessaryTimeMap = Map<string, NecessaryTime>;

export interface TrainType {
  id: number;
  name: string;
  necessaryTimesA: NecessaryTimeMap;
  necessaryTimesB: NecessaryTimeMap;
  stoppingStationList: stationId[];
  trainIdList: number[];
  lineColor: string;
}

export type TrainTypeMap = Map<number, TrainType>;

export interface TerminalStation {
  startingStationId: stationId;
  endingStationId: stationId;
}
