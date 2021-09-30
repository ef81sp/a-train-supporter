import { NecessaryTime, Station, StationList, TerminalStation, TrainType } from '@/types';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import { InjectionKey } from 'vue';

export interface State {
  stationList: StationList;
  trainTypes: Map<string, TrainType>;
}

export interface Getters {
  getStationNameList: string[];
  getJunctionStationNameList: string[];
  getTerminalStation: TerminalStation;
  getTrainType: (key: string) => TrainType | undefined;
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
    trainTypes: new Map<string, TrainType>([
      [
        '特急',
        {
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
      return (key: string) => trainTypes.get(key);
    },
  },
  mutations: {},
  actions: {},
  modules: {},
});

export const useStore = (): IStore => {
  return baseUseStore(key);
};
