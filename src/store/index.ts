import {
  NecessaryTime,
  Station,
  StationList,
  TerminalStation,
  TrainType,
} from '@/types';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import { InjectionKey } from 'vue';
import { chartJsData, chartJsDataSet, DiagramData } from '@/types/diagram';
import { max } from 'date-fns';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/common/const';

export interface State {
  stationList: StationList;
  trainTypes: Map<number, TrainType>;
  diagramData: chartJsData;
  showingTrainId: number;
  nextTrainId: number;
  __chartRefresh: () => void;
}

export interface Getters {
  getStationNameList: string[];
  getShouldRecordTimeStationNameList: string[];
  getTerminalStation: TerminalStation;
  getTrainType: (key: number) => TrainType | undefined;
  getDiagramData: chartJsData;
  getMinAndMaxTimeOnDiagramData: { min: string; max: string };
  getTrainDiagramDataSetById: (id: number) => chartJsDataSet | undefined;
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

export default createStore<State>({
  state: {
    stationList: {
      stations: [
        { name: '上野', shouldRecordTime: true },
        { name: '日暮里', shouldRecordTime: false },
        { name: '三河島', shouldRecordTime: false },
        { name: '南千住', shouldRecordTime: false },
        { name: '北千住', shouldRecordTime: true },
        { name: '松戸', shouldRecordTime: true },
        { name: '柏', shouldRecordTime: true },
      ],
      startingStationName: '上野',
      endingStationName: '柏',
    },
    trainTypes: new Map<number, TrainType>([
      // [
      //   1,
      //   {
      //     id: 1,
      //     name: '特急',
      //     necessaryTimesA: new Map<string, NecessaryTime>([
      //       [
      //         '上野-松戸',
      //         { from: '上野', to: '松戸', necessaryTime: 17, id: '上野-松戸' },
      //       ],
      //       [
      //         '松戸-柏',
      //         { from: '松戸', to: '柏', necessaryTime: 4, id: '松戸-柏' },
      //       ],
      //     ]),
      //     necessaryTimesB: new Map<string, NecessaryTime>([
      //       [
      //         '柏-松戸',
      //         { from: '柏', to: '松戸', necessaryTime: 4, id: '柏-松戸' },
      //       ],
      //       [
      //         '松戸-上野',
      //         { from: '松戸', to: '上野', necessaryTime: 17, id: '松戸-上野' },
      //       ],
      //     ]),
      //     stoppingStationList: ['上野', '松戸', '柏'],
      //     trainIdList: [1],
      //     defaultBorderColor: '#FF2222',
      //   },
      // ],
      // [
      //   2,
      //   {
      //     id: 2,
      //     name: '普通',
      //     necessaryTimesA: new Map(),
      //     necessaryTimesB: new Map(),
      //     stoppingStationList: ['上野', '北千住', '松戸', '柏'],
      //     trainIdList: [],
      //     defaultBorderColor: '22FF22',
      //   },
      // ],
    ]),
    diagramData: {
      labels: [
        // '上野', '北千住', '松戸', '柏'
      ],
      datasets: [
        // {
        //   label: '特急-1',
        //   id: 1,
        //   data: [
        //     // { time: '2021-10-14 04:30', station: '上野' },
        //     // { time: '2021-10-14 04:47', station: '松戸' },
        //     // { time: '2021-10-14 04:51', station: '柏' },
        //     // { time: '2021-10-14 05:01', station: '柏' },
        //     // { time: '2021-10-14 05:05', station: '松戸' },
        //     // { time: '2021-10-14 05:22', station: '上野' },
        //   ],
        //   borderColor: '#FF2222',
        // },
      ],
    },
    showingTrainId: 1,
    nextTrainId: 6,
    __chartRefresh: () => void 0,
  },
  getters: {
    getStationNameList({ stationList }): Getters['getStationNameList'] {
      return stationList.stations.map((v: Station) => v.name);
    },
    getShouldRecordTimeStationNameList({
      stationList,
    }): Getters['getShouldRecordTimeStationNameList'] {
      return stationList.stations
        .filter((v) => v.shouldRecordTime)
        .map((v) => v.name);
    },
    getTerminalStation({ stationList }): Getters['getTerminalStation'] {
      return {
        startingStationName: stationList.startingStationName,
        endingStationName: stationList.endingStationName,
      };
    },
    getTrainType({ trainTypes }): Getters['getTrainType'] {
      return (key: number) => trainTypes.get(key);
    },
    getDiagramData({ diagramData }: State): Getters['getDiagramData'] {
      return diagramData;
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
  },
  mutations: {
    updateStationList(state, stations: Station[]) {
      state.diagramData.labels = stations
        .filter((v) => v.shouldRecordTime)
        .map((v) => v.name);
      state.stationList.stations = stations;
      state.stationList.startingStationName = stations[0].name;
      state.stationList.endingStationName = stations[stations.length - 1].name;
      state.__chartRefresh();
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
        borderColor: trainType.defaultBorderColor,
      });
    },
    incrementTrainId(state) {
      state.nextTrainId++;
    },
    setChartRefresh(state, chartRef) {
      state.__chartRefresh = chartRef;
    },
  },
  actions: {
    addTrain(context, trainTypeId) {
      const nextTrainId = context.state.nextTrainId;
      context.commit('addTrain', { trainTypeId, trainId: nextTrainId });
      context.commit('incrementTrainId');
    },
  },
  modules: {},
});

export const useStore = () => {
  return baseUseStore(key) as IStore;
};
