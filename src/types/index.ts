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

export interface TrainType {
  id: number;
  name: string;
  necessaryTimes: Map<String, NecessaryTime>;
}

export interface TerminalStation {
  startingStationName: string;
  endingStationName: string;
}
