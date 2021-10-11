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
  addInitialTrainType: void;
  updateTrainType: { id: number; data: TrainType };
  addTrain: { trainTypeId: number; trainId: number };
  incrementTrainId: void;
  setChartRefresh: { chartRef: () => void };
  __updateLineColorAndTrainName: { trainTypeId: number };
  __logHistory: void;
  undo: void;
  redo: void;
  loadData: { id: number }
  setSaveId: {id: number}
}

export interface MyCommit {
  <T extends keyof MutationPayload>(
    type: T,
    payload?: MutationPayload[T]
  ): void;
}
export type MyMutation = {
  [P in keyof MutationPayload]: (
    state: State,
    payload: MutationPayload[P]
  ) => void;
};
