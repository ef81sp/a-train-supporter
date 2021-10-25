import { NecessaryTimeMap, Station, TrainType } from "@/types";
import { DiagramData } from "@/types/diagram";
import { ActionContext } from "vuex";
import { State } from ".";
import { MyCommit } from "./mutations.type";

interface MyActionContext extends ActionContext<State, State> {
  commit: MyCommit;
}

interface ActionPayload {
  updateStationList: Station[];
  updateTrainTypeNecessaryTimeTable: {
    trainTypeId: number;
    boundFor: "A" | "B";
    newNecessaryTimeMap: NecessaryTimeMap;
  };
  updateDiagramData: { id: number; data: DiagramData[] };
  addTrain: { trainTypeId: number };
  updateTrainType: { id: number; data: TrainType };
  deleteTrainType: { id: number };
  loadData: { id: number };
}

interface NoPayloadAction {
  addInitialTrainType: void;
  initialize: void;
}

export interface MyDispatch {
  <T extends keyof ActionPayload>(
    type: T,
    payload: ActionPayload[T]
  ): Promise<void>;
  <T extends keyof NoPayloadAction>(type: T): Promise<void>;
}

type MyActionsWithPayload = {
  [P in keyof ActionPayload]: (
    ctx: MyActionContext,
    payload: ActionPayload[P]
  ) => void;
};

type MyActionsNoPayload = {
  [P in keyof NoPayloadAction]: (ctx: MyActionContext) => void;
};

export type MyActions = MyActionsWithPayload & MyActionsNoPayload;
