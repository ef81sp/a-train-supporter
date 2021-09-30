import {
  NecessaryTime,
  Station,
  StationList,
  TerminalStation,
  TrainType,
} from '@/types';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import { InjectionKey } from 'vue';
import { chartJsData, DiagramData } from '@/types/diagram';

export interface State {
  stationList: StationList;
  trainTypes: Map<number, TrainType>;
  diagramData: chartJsData;
}

export interface Getters {
  getStationNameList: string[];
  getJunctionStationNameList: string[];
  getTerminalStation: TerminalStation;
  getTrainType: (key: number) => TrainType | undefined;
  getChartJsData: chartJsData;
}

// getters等々に補完が効かないのきつすぎる
export interface IStore extends Store<State> {
  getters: Getters;
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
      [
        1,
        {
          id: 1,
          name: '特急',
          necessaryTimes: new Map<string, NecessaryTime>([
            [
              '上野-松戸',
              { from: '上野', to: '松戸', necessaryTime: 17, id: '上野-松戸' },
            ],
            [
              '松戸-柏',
              { from: '松戸', to: '柏', necessaryTime: 4, id: '松戸-柏' },
            ],
            [
              '柏-松戸',
              { from: '柏', to: '松戸', necessaryTime: 4, id: '柏-松戸' },
            ],
            [
              '松戸-上野',
              { from: '松戸', to: '上野', necessaryTime: 17, id: '松戸-上野' },
            ],
          ]),
        },
      ],
    ]),
    diagramData: {
      labels: ['上野', '北千住', '松戸', '柏'],
      datasets: [
        {
          label: 'ときわ',
          id: 1,
          data: [
            { time: '14 04:30', station: '上野' },
            { time: '14 04:47', station: '松戸' },
            { time: '14 04:51', station: '柏' },
            { time: '14 05:01', station: '柏' },
            { time: '14 05:05', station: '松戸' },
            { time: '14 05:22', station: '上野' },
          ],
          borderColor: '#FF2222',
        },
      ],
    },
  },
  getters: {
    getStationNameList({ stationList }): Getters['getStationNameList'] {
      return stationList.stations.map((v: Station) => v.name);
    },
    getJunctionStationNameList({
      stationList,
    }): Getters['getJunctionStationNameList'] {
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
    getChartJsData({ diagramData: chartJsData }): Getters['getChartJsData'] {
      return chartJsData;
    },
  },
  mutations: {
    updateStationList({ diagramData: chartJsData }: State, stations: string[]) {
      chartJsData.labels = stations;
    },
    updateDiagramData(
      { diagramData: chartJsData }: State,
      { id, data }: { id: number; data: DiagramData[] }
    ) {
      const target = chartJsData.datasets.find((v) => v.id === id);
      if (target) {
        target.data = data;
      }
    },
  },
  actions: {},
  modules: {},
});

export const useStore = (): IStore => {
  return baseUseStore(key);
};
