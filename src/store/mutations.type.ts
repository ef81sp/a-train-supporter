import { NecessaryTimeMap, Station, TrainType } from '@/types';
import { DiagramData } from '@/types/diagram';
import { State } from '.';

interface MutationPayload {
  updateStationList: Station[];
  updateTrainTypeNecessaryTimeTable: {
    trainTypeId: number;
    boundFor: 'A' | 'B';
    newNecessaryTimeMap: NecessaryTimeMap;
  };
  updateDiagramData: { id: number; data: DiagramData[] };
  setShowingTrainId: { id: number };
  updateTrainType: { id: number; data: TrainType };
  addTrain: { trainTypeId: number; trainId: number };
  setChartRefresh: { chartRef: () => void };
  __updateLineColorAndTrainName: { trainTypeId: number };
  loadData: { id: number };
  setSaveId: { id: number };
}

interface NoPayloadMutation {
  addInitialTrainType: void;
  incrementTrainId: void;
  __logHistory: void;
  undo: void;
  redo: void;
}

export interface MyCommit {
  <T extends keyof MutationPayload>(type: T, payload: MutationPayload[T]): void;
  <T extends keyof NoPayloadMutation>(type: T): void;
}
type MyMutationWithPayload = {
  [P in keyof MutationPayload]: (
    state: State,
    payload: MutationPayload[P]
  ) => void;
};
type MyMutationNoPayload = {
  [P in keyof NoPayloadMutation]: (state: State) => void;
};
export type MyMutation = MyMutationWithPayload & MyMutationNoPayload;
