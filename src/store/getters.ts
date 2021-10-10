import { DATE_FORMAT } from '@/common/const';
import { Station, stationId, TerminalStation, TrainType } from '@/types';
import { chartJsData, chartJsDataSet } from '@/types/diagram';
import dayjs from 'dayjs';
import { State } from '.';
import { GetterTree } from 'vuex';
import rfdc from 'rfdc';
const clone = rfdc();

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

export const getters: GetterTree<State, State> = {
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
    const result: chartJsData = clone(diagramData);
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
};
