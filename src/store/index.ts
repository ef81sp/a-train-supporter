import {
  NecessaryTime,
  NecessaryTimeMap,
  Station,
  stationId,
  StationList,
  TerminalStation,
  TrainType,
  TrainTypeMap,
} from '@/types';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import { InjectionKey } from 'vue';
import { chartJsData, chartJsDataSet, DiagramData } from '@/types/diagram';
import dayjs from 'dayjs';
import { DATE_FORMAT, LINE_COLORS } from '@/common/const';
import clonedeep from 'lodash.clonedeep';
import equal from 'fast-deep-equal/es6';
import {
  generateInitialNecessaryTime,
  getRandomLineColor,
} from '@/logics/diagram';

export interface State {
  stationList: StationList;
  trainTypes: TrainTypeMap;
  diagramData: chartJsData;
  showingTrainId: number;
  nextTrainId: number;
  __chartRefresh: () => void;
  __history?: { stack: State[]; nowIndex: number };
}

export interface Getters {
  getStationNameList: string[];
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

export interface Mutations {
  updateStationsList: (
    { diagramData: chartJsData }: State,
    stations: string[]
  ) => void;
  updateDiagramData: (
    { diagramData: chartJsData }: State,
    { id, data }: { id: number; data: DiagramData[] }
  ) => void;
  setShowingTrainId: (state: State, id: number) => void;
}

// getters等々に補完が効かないのきつすぎる
export interface IStore extends Store<State> {
  getters: Getters;
  mutations: Mutations;
}

export const key: InjectionKey<Store<State>> = Symbol();

const initialState: State = {
  stationList: {
    stations: [],
    startingStationId: 0,
    endingStationId: 0,
  },
  trainTypes: new Map<number, TrainType>([]),
  diagramData: {
    labels: [],
    datasets: [],
  },
  showingTrainId: 1,
  nextTrainId: 6,
  __chartRefresh: () => void 0,
};

const mockState: State = {
  stationList: {
    stations: [
      { id: 1, name: '上野', shouldRecordTime: true },
      { id: 2, name: '日暮里', shouldRecordTime: false },
      { id: 3, name: '三河島', shouldRecordTime: false },
      { id: 4, name: '南千住', shouldRecordTime: false },
      { id: 5, name: '北千住', shouldRecordTime: true },
      { id: 6, name: '松戸', shouldRecordTime: true },
      { id: 7, name: '柏', shouldRecordTime: true },
    ],
    startingStationId: 1,
    endingStationId: 7,
  },
  trainTypes: new Map<number, TrainType>([
    [
      1,
      {
        id: 1,
        name: '特急',
        necessaryTimesA: new Map<string, NecessaryTime>([
          ['1-6', { from: 1, to: 6, necessaryTime: 17, id: '1-6' }],
          ['6-7', { from: 6, to: 7, necessaryTime: 4, id: '6-7' }],
        ]),
        necessaryTimesB: new Map<string, NecessaryTime>([
          ['7-6', { from: 7, to: 6, necessaryTime: 4, id: '7-6' }],
          ['6-1', { from: 6, to: 1, necessaryTime: 17, id: '6-1' }],
        ]),
        stoppingStationList: [1, 6, 7],
        trainIdList: [1],
        lineColor: LINE_COLORS[0].value,
      },
    ],
    // [
    //   2,
    //   {
    //     id: 2,
    //     name: '普通',
    //     necessaryTimesA: new Map(),
    //     necessaryTimesB: new Map(),
    //     stoppingStationList: ['上野', '北千住', '松戸', '柏'],
    //     trainIdList: [],
    //     lineColor: '22FF22',
    //   },
    // ],
  ]),
  diagramData: {
    labels: ['上野', '北千住', '松戸', '柏'],
    datasets: [
      {
        label: '特急-1',
        id: 1,
        data: [
          { time: '2021-10-14 04:30', stationId: 1 },
          { time: '2021-10-14 04:47', stationId: 6 },
          { time: '2021-10-14 04:51', stationId: 7 },
          { time: '2021-10-14 05:01', stationId: 7 },
          { time: '2021-10-14 05:05', stationId: 6 },
          { time: '2021-10-14 05:22', stationId: 1 },
        ],
        borderColor: LINE_COLORS[0].value,
      },
    ],
  },
  showingTrainId: 1,
  nextTrainId: 6,
  __chartRefresh: () => void 0,
};

export default createStore<State>({
  state: Object.assign(clonedeep(mockState), {
    __history: {
      stack: [mockState],
      nowIndex: 0,
    },
  }),
  getters: {
    getStationNameList({ stationList }): Getters['getStationNameList'] {
      return stationList.stations.map((v: Station) => v.name);
    },
    getStation({ stationList }): Getters['getStation'] {
      return (id) => stationList.stations.find((v) => v.id === id);
    },
    getShouldRecordTimeStationList({
      stationList,
    }): Getters['getShouldRecordTimeStationList'] {
      return stationList.stations.filter((v) => v.shouldRecordTime);
    },
    getTerminalStation({ stationList }): Getters['getTerminalStation'] {
      return {
        startingStationId: stationList.startingStationId,
        endingStationId: stationList.endingStationId,
      };
    },
    getTrainType({ trainTypes }): Getters['getTrainType'] {
      return (key: number) => trainTypes.get(key);
    },
    getTrainTypeByTrainId({ trainTypes }): Getters['getTrainTypeByTrainId'] {
      return (key: number) =>
        [...trainTypes.values()].find((v) => v.trainIdList.includes(key));
    },
    getChatrJsData(
      { diagramData }: State,
      getters: Getters
    ): Getters['getChatrJsData'] {
      const result: chartJsData = clonedeep(diagramData);
      for (const dataset of result.datasets) {
        for (const data of dataset.data) {
          data.name = getters.getStation(data.stationId)?.name;
        }
      }
      return result;
    },
    getMinAndMaxTimeOnDiagramData({
      diagramData,
    }: State): Getters['getMinAndMaxTimeOnDiagramData'] {
      const result = diagramData.datasets.reduce(
        (prev, cur, idx) => {
          if (cur.data.length === 0) return prev;
          const lastItemIdx = cur.data.length - 1;
          if (idx === 0) {
            return { min: cur.data[0].time, max: cur.data[lastItemIdx].time };
          }
          if (prev.min === '' && prev.max === '') {
            return {
              min: cur.data[0].time,
              max: cur.data[lastItemIdx].time,
            };
          }
          return {
            min: dayjs(cur.data[0].time, DATE_FORMAT).isBefore(
              dayjs(prev.min, DATE_FORMAT)
            )
              ? cur.data[0].time
              : prev.min,
            max: dayjs(cur.data[lastItemIdx].time, DATE_FORMAT).isAfter(
              dayjs(prev.max, DATE_FORMAT)
            )
              ? cur.data[lastItemIdx].time
              : prev.max,
          };
        },
        { min: '', max: '' }
      );

      result.min = dayjs(result.min, DATE_FORMAT)
        .subtract(15, 'minute')
        .format(DATE_FORMAT);
      result.max = dayjs(result.max, DATE_FORMAT)
        .add(15, 'minute')
        .format(DATE_FORMAT);
      return result;
    },
    getTrainDiagramDataSetById({
      diagramData,
    }): Getters['getTrainDiagramDataSetById'] {
      return (id) => diagramData.datasets.find((v) => v.id === id);
    },
    getHistoryInfo({ __history }): Getters['getHistoryInfo'] {
      return {
        nowIndex: __history ? __history.nowIndex : 0,
        length: __history ? __history.stack.length : 0,
      };
    },
  },
  mutations: {
    updateStationList(state, stations: Station[]) {
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
      {
        trainTypeId,
        boundFor,
        newNecessaryTimeMap,
      }: {
        trainTypeId: number;
        boundFor: 'A' | 'B';
        newNecessaryTimeMap: NecessaryTimeMap;
      }
    ) {
      const target = state.trainTypes.get(trainTypeId);
      if (!target) return;
      if (boundFor === 'A') {
        target.necessaryTimesA = newNecessaryTimeMap;
      } else {
        target.necessaryTimesB = newNecessaryTimeMap;
      }
    },
    updateDiagramData(
      state,
      { id, data }: { id: number; data: DiagramData[] }
    ) {
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
    setShowingTrainId(state, id: number) {
      state.showingTrainId = id;
    },
    addInitialTrainType(state) {
      const newKey = Math.max(...state.trainTypes.keys()) + 1;
      const newTrainType: TrainType = {
        id: newKey,
        name: `種別${newKey}`,
        trainIdList: [],
        stoppingStationList: state.stationList.stations.map((v) => v.id),
        necessaryTimesA: generateInitialNecessaryTime(state.stationList, 'A'),
        necessaryTimesB: generateInitialNecessaryTime(state.stationList, 'B'),
        lineColor: getRandomLineColor(state.trainTypes).value,
      };
      state.trainTypes.set(newKey, newTrainType);
    },
    updateTrainType(state, { id, data }: { id: number; data: TrainType }) {
      state.trainTypes.set(id, data);
    },
    __updateLineColorAndTrainName(state, trainTypeId: number) {
      const trainType = state.trainTypes.get(trainTypeId);
      if (!trainType) return;
      let trainTypeNo = 1;
      for (const dataset of state.diagramData.datasets) {
        if (!trainType.trainIdList.includes(dataset.id)) continue;
        dataset.borderColor = trainType.lineColor;
        dataset.label = `${trainType.name}-${trainTypeNo++}`;
      }
    },
    addTrain(
      state,
      { trainTypeId, trainId }: { trainTypeId: number; trainId: number }
    ) {
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
    },
    incrementTrainId(state) {
      state.nextTrainId++;
    },
    setChartRefresh(state, chartRef) {
      state.__chartRefresh = chartRef;
    },
    __logHistory(state) {
      const copiedState = clonedeep(state);
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
    },
    undo(state) {
      if (!state.__history) return;
      if (state.__history.stack.length === 0) return;
      if (state.__history.nowIndex === 0) return;

      const newState = clonedeep(
        state.__history.stack[state.__history.nowIndex - 1]
      );
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

      const newState = clonedeep(
        state.__history.stack[state.__history.nowIndex + 1]
      );
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
  },
  actions: {
    addTrain(context, trainTypeId) {
      const nextTrainId = context.state.nextTrainId;
      context.commit('addTrain', { trainTypeId, trainId: nextTrainId });
      context.commit('incrementTrainId');
      context.commit('__logHistory');
    },
    addInitialTrainType(context) {
      context.commit('addInitialTrainType');
      const newTrainTypeId = Math.max(...context.state.trainTypes.keys());
      context.dispatch('addTrain', newTrainTypeId);
      // context.commit('__logHistory'); // addTrain側でやるので省略
    },
    updateTrainType(context, payload: { id: number; data: TrainType }) {
      context.commit('updateTrainType', payload);
      context.commit('__updateLineColorAndTrainName', payload.id);
      context.state.__chartRefresh();
      context.commit('__logHistory');
    },
    updateTrainTypeNecessaryTimeTable(context, payload) {
      context.commit('updateTrainTypeNecessaryTimeTable', payload);
      context.commit('__logHistory');
    },
    updateDiagramData(context, payload: { id: number; data: DiagramData[] }) {
      context.commit('updateDiagramData', payload);
      context.commit('__logHistory');
    },
    updateStationList(context, stations: Station[]) {
      context.commit('updateStationList', stations);
      context.commit('__logHistory');
    },
  },
  modules: {},
});

export const useStore = () => {
  return baseUseStore(key) as IStore;
};
