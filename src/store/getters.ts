import { DATE_FORMAT } from "@/common/const";
import dayjs from "dayjs";
import rfdc from "rfdc";
import { MyGettersFunctions } from "./getters.type";
const clone = rfdc();

export const getters: MyGettersFunctions = {
  getStation({ stationList }) {
    return (id) => stationList.stations.find((v) => v.id === id);
  },
  getShouldRecordTimeStationList({ stationList }) {
    return stationList.stations.filter((v) => v.shouldRecordTime);
  },
  getTerminalStation({ stationList }) {
    return {
      startingStationId: stationList.startingStationId,
      endingStationId: stationList.endingStationId,
    };
  },
  getTrainType({ trainTypes }) {
    return (key: number) => trainTypes.get(key);
  },
  getTrainTypeByTrainId({ trainTypes }) {
    return (key: number) =>
      [...trainTypes.values()].find((v) => v.trainIdList.includes(key));
  },
  getChatrJsData({ diagramData }, getters) {
    const result = clone(diagramData);
    for (const dataset of result.datasets) {
      for (const data of dataset.data) {
        data.name = getters.getStation(data.stationId)?.name;
      }
    }
    return result;
  },
  getMinAndMaxTimeOnDiagramData({ diagramData }) {
    const result = diagramData.datasets.reduce(
      (prev, cur, idx) => {
        if (cur.data.length === 0) return prev;
        const lastItemIdx = cur.data.length - 1;
        if (idx === 0) {
          return { min: cur.data[0].time, max: cur.data[lastItemIdx].time };
        }
        if (prev.min === "" && prev.max === "") {
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
      { min: "", max: "" }
    );

    result.min = dayjs(result.min, DATE_FORMAT)
      .subtract(15, "minute")
      .format(DATE_FORMAT);
    result.max = dayjs(result.max, DATE_FORMAT)
      .add(15, "minute")
      .format(DATE_FORMAT);
    return result;
  },
  getTrainDiagramDataSetById({ diagramData }) {
    return (id) => diagramData.datasets.find((v) => v.id === id);
  },
  getHistoryInfo({ __history }) {
    return {
      nowIndex: __history ? __history.nowIndex : 0,
      length: __history ? __history.stack.length : 0,
    };
  },
};
