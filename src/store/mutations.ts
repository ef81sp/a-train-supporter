import { DATE_FORMAT } from "@/common/const";
import {
  generateInitialNecessaryTime,
  getRandomLineColor,
} from "@/logics/diagram";
import { TrainType } from "@/types";
import { DiagramData } from "@/types/diagram";
import dayjs from "dayjs";
import { initialState, State } from ".";
import equal from "fast-deep-equal/es6";

import rfdc from "rfdc";
import { jsonParse, jsonStringify } from "@/common/util";
import { MyMutation } from "./mutations.type";
const clone = rfdc();

const mergeState = (
  state: State,
  newState: State,
  options: { resetHistory: boolean } = { resetHistory: false }
) => {
  const saveId = state.__saveId;
  const copyState = clone(newState);
  const initialHistory = {
    stack: [copyState],
    nowIndex: 0,
  };
  if (!state.__history || options.resetHistory) {
    Object.assign(
      state,
      Object.assign(newState, {
        __history: initialHistory,
        __saveId: saveId,
      })
    );
    return;
  }

  const stack = state.__history.stack.concat(copyState);
  let index = stack.length - 1;
  if (state.__history.nowIndex === 0 && state.__history.stack.length === 0) {
    index = 0;
  }
  Object.assign(
    state,
    Object.assign(newState, {
      __history: {
        stack,
        nowIndex: index,
      },
      __saveId: saveId,
    })
  );
};

export * from "./mutations.type";

export const mutations: MyMutation = {
  updateStationList: (state, stations) => {
    state.diagramData.labels = stations
      .filter((v) => v.shouldRecordTime)
      .map((v) => v.name);
    state.stationList.stations = stations;
    state.stationList.startingStationId = stations[0].id;
    state.stationList.endingStationId = stations[stations.length - 1].id;
    state.__chartRefresh();
  },
  updateTrainTypeNecessaryTimeTable(
    state,
    { trainTypeId, boundFor, newNecessaryTimeMap }
  ) {
    const target = state.trainTypes.get(trainTypeId);
    if (!target) return;
    if (boundFor === "A") {
      target.necessaryTimesA = newNecessaryTimeMap;
    } else {
      target.necessaryTimesB = newNecessaryTimeMap;
    }
  },
  updateDiagramData(state, { id, data }) {
    const target = state.diagramData.datasets.find((v) => v.id === id);
    if (target) {
      target.data = dedupe(data).sort((a, b) => {
        return dayjs(a.time, DATE_FORMAT).isBefore(dayjs(b.time, DATE_FORMAT))
          ? -1
          : 1;
      });
    }

    function dedupe(array: DiagramData[]) {
      return [
        ...new Map(array.map((v) => [Object.values(v).join(), v])).values(),
      ];
    }
  },
  setShowingTrainId(state, { id }) {
    state.showingTrainId = id;
  },
  addInitialTrainType(state) {
    const newKey = Math.max(...state.trainTypes.keys(), 0) + 1;
    const newTrainType: TrainType = {
      id: newKey,
      name: `??????${newKey}`,
      trainIdList: [],
      stoppingStationList: state.stationList.stations.map((v) => v.id),
      necessaryTimesA: generateInitialNecessaryTime(state.stationList, "A"),
      necessaryTimesB: generateInitialNecessaryTime(state.stationList, "B"),
      lineColor: getRandomLineColor(state.trainTypes).value,
    };
    state.trainTypes.set(newKey, newTrainType);
  },
  updateTrainType(state, { id, data }) {
    state.trainTypes.set(id, data);
  },
  deleteTrainType(state, { id }) {
    const targetTrainType = state.trainTypes.get(id);
    state.diagramData.datasets = state.diagramData.datasets.filter(
      (v) => !targetTrainType?.trainIdList.includes(v.id)
    );
    state.trainTypes.delete(id);
  },
  refreshTrainLabel(state, { trainTypeId }) {
    const targetTrainType = state.trainTypes.get(trainTypeId);
    if (!targetTrainType) return;
    let i = 1;
    state.diagramData.datasets.forEach((dataset) => {
      if (!targetTrainType.trainIdList.includes(dataset.id)) return;
      dataset.label = `${targetTrainType.name}-${i++}`;
    });
  },
  addTrain(state, { trainTypeId, trainId }) {
    const trainType = state.trainTypes.get(trainTypeId);
    if (!trainType) return;

    trainType.trainIdList.push(trainId);
    const label = `${trainType.name}-${trainType.trainIdList.length}`;
    state.diagramData.datasets.push({
      label,
      id: trainId,
      data: [],
      borderColor: trainType.lineColor,
    });
    state.diagramData.datasets.sort((a, b) => {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      if (a.data.length === 0 && b.data.length !== 0) return 1;
      if (b.data.length === 0 && a.data.length !== 0) return -1;
      return 1;
    });
    state.showingTrainId = trainId;
  },
  deleteTrain(state, { trainId }) {
    state.diagramData.datasets = state.diagramData.datasets.filter(
      (v) => v.id !== trainId
    );
    state.trainTypes.forEach((trainType) => {
      trainType.trainIdList = trainType.trainIdList.filter(
        (v) => v !== trainId
      );
    });
  },

  incrementTrainId(state) {
    state.nextTrainId++;
  },
  setChartRefresh(state, { chartRefresh }) {
    state.__chartRefresh = chartRefresh;
  },
  __updateLineColorAndTrainName(state, { trainTypeId }) {
    const trainType = state.trainTypes.get(trainTypeId);
    if (!trainType) return;
    let trainTypeNo = 1;
    for (const dataset of state.diagramData.datasets) {
      if (!trainType.trainIdList.includes(dataset.id)) continue;
      dataset.borderColor = trainType.lineColor;
      dataset.label = `${trainType.name}-${trainTypeNo++}`;
    }
  },
  __logHistory(state) {
    const copiedState = clone(state);
    delete copiedState.__history;
    if (!state.__history) return;
    if (equal(state.__history.stack[state.__history.nowIndex], copiedState)) {
      return;
    }
    state.__history.stack = state.__history.stack.slice(
      0,
      state.__history.nowIndex + 1
    );
    state.__history.stack.push(copiedState);
    if (state.__history.stack.length > 100) {
      state.__history.stack.shift();
    }
    state.__history.nowIndex = state.__history.stack.length - 1;

    // localStorage?????????
    delete copiedState.__saveId;
    localStorage.setItem(String(state.__saveId), jsonStringify(copiedState));
  },
  undo(state) {
    if (!state.__history) return;
    if (state.__history.stack.length === 0) return;
    if (state.__history.nowIndex === 0) return;

    const newState = clone(state.__history.stack[state.__history.nowIndex - 1]);
    Object.assign(
      state,
      Object.assign(newState, {
        __history: {
          stack: state.__history.stack,
          nowIndex: state.__history.nowIndex - 1,
        },
      })
    );
  },
  redo(state) {
    if (!state.__history) return;
    if (state.__history.stack.length === 0) return;

    const newState = clone(state.__history.stack[state.__history.nowIndex + 1]);
    Object.assign(
      state,
      Object.assign(newState, {
        __history: {
          stack: state.__history.stack,
          nowIndex: state.__history.nowIndex + 1,
        },
      })
    );
  },
  loadData(state, { id }) {
    const rawData = localStorage.getItem(String(id));
    if (!rawData) {
      const newState = clone(initialState);
      mergeState(state, newState);
    } else {
      const newState = jsonParse(rawData);
      mergeState(state, newState, { resetHistory: true });
    }
  },
  initialize(state) {
    const newState = clone(initialState);
    mergeState(state, newState);
  },
  setSaveId(state, { id }) {
    state.__saveId = id;
  },
  updateInputtingPreviewDiagramDatas(state, { data }) {
    state.inputtingPreviewDiagramDatas = data;
  },
  updateIsShowPreview(state, { value }) {
    state.isShowPreview = value;
  },
};
