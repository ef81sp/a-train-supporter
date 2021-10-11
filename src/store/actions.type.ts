import { NecessaryTimeMap, Station, TrainType } from '@/types';
import { DiagramData } from '@/types/diagram';
import { ActionContext } from 'vuex';
import { State } from '.';
import { MyCommit } from './mutations.type';

interface MyActionContext extends ActionContext<State, State> {
  commit: MyCommit;
}

interface ActionPayload {
  updateStationList: Station[];
  updateTrainTypeNecessaryTimeTable: {
    trainTypeId: number;
    boundFor: 'A' | 'B';
    newNecessaryTimeMap: NecessaryTimeMap;
  };
  updateDiagramData: { id: number; data: DiagramData[] };
  addTrain: { trainTypeId: number };
  addInitialTrainType: void;
  updateTrainType: { id: number; data: TrainType };
  loadData: { id: number };
}

export interface MyDispatch {
  <T extends keyof ActionPayload>(
    type: T,
    payload?: ActionPayload[T]
  ): Promise<any>;
}

export type MyActions = {
  [P in keyof ActionPayload]: (
    ctx: MyActionContext,
    payload: ActionPayload[P]
  ) => void;
};
