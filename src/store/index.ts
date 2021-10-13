import { NecessaryTime, StationList, TrainType, TrainTypeMap } from '@/types';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import { InjectionKey } from 'vue';
import { chartJsData } from '@/types/diagram';
import { LINE_COLORS } from '@/common/const';
import rfdc from 'rfdc';
import { getters } from './getters';
import { mutations } from './mutations';
import { actions } from './actions';
import { MyCommit } from './mutations.type';
import { MyDispatch } from './actions.type';
import { MyGetters } from './getters.type';

const clonedeep = rfdc({ circles: true });

export interface State {
  stationList: StationList;
  trainTypes: TrainTypeMap;
  diagramData: chartJsData;
  showingTrainId: number;
  nextTrainId: number;
  __chartRefresh: () => void;
  __history?: { stack: State[]; nowIndex: number };
  __saveId?: number;
}

// getters等々に補完が効かないのきつすぎる
export interface MyStore extends Store<State> {
  getters: MyGetters;
  commit: MyCommit;
  dispatch: MyDispatch;
}

export const key: InjectionKey<Store<State>> = Symbol();

export const initialState: State = {
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
  nextTrainId: 2,
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
    [
      2,
      {
        id: 2,
        name: '普通',
        necessaryTimesA: new Map<string, NecessaryTime>([
          ['1-6', { from: 1, to: 6, necessaryTime: 17, id: '1-6' }],
          ['6-7', { from: 6, to: 7, necessaryTime: 4, id: '6-7' }],
        ]),
        necessaryTimesB: new Map<string, NecessaryTime>([
          ['7-6', { from: 7, to: 6, necessaryTime: 4, id: '7-6' }],
          ['6-1', { from: 6, to: 1, necessaryTime: 17, id: '6-1' }],
        ]),
        stoppingStationList: [1, 5, 6, 7],
        trainIdList: [2],
        lineColor: LINE_COLORS[5].value,
      },
    ],
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
      {
        label: '普通-1',
        id: 2,
        data: [
          { time: '2021-10-14 04:30', stationId: 1 },
          { time: '2021-10-14 04:47', stationId: 6 },
          { time: '2021-10-14 04:51', stationId: 7 },
          { time: '2021-10-14 05:01', stationId: 7 },
          { time: '2021-10-14 05:05', stationId: 6 },
          { time: '2021-10-14 05:22', stationId: 1 },
        ],
        borderColor: LINE_COLORS[5].value,
      },
    ],
  },
  showingTrainId: 1,
  nextTrainId: 3,
  __chartRefresh: () => void 0,
  __saveId: 1,
};

export default createStore<State>({
  state: Object.assign(clonedeep(mockState), {
    __history: {
      stack: [mockState],
      nowIndex: 0,
    },
  }),
  getters,
  mutations,
  actions: actions,
  modules: {},
});

export const useStore = () => {
  return baseUseStore(key) as MyStore;
};
