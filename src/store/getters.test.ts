import { LINE_COLORS } from "@/common/const";
import { NecessaryTime, TrainType } from "@/types";
import { State } from ".";
import { getters } from "./getters";
import rfdc from "rfdc";
import { MyGetters } from "./getters.type";
const clone = rfdc();

const mockState: State = {
  stationList: {
    stations: [
      { id: 1, name: "上野", shouldRecordTime: true },
      { id: 2, name: "日暮里", shouldRecordTime: false },
      { id: 3, name: "三河島", shouldRecordTime: false },
      { id: 4, name: "南千住", shouldRecordTime: false },
      { id: 5, name: "北千住", shouldRecordTime: true },
      { id: 6, name: "松戸", shouldRecordTime: true },
      { id: 7, name: "柏", shouldRecordTime: true },
    ],
    startingStationId: 1,
    endingStationId: 7,
  },
  trainTypes: new Map<number, TrainType>([
    [
      1,
      {
        id: 1,
        name: "特急",
        necessaryTimesA: new Map<string, NecessaryTime>([
          ["1-6", { from: 1, to: 6, necessaryTime: 17, id: "1-6" }],
          ["6-7", { from: 6, to: 7, necessaryTime: 4, id: "6-7" }],
        ]),
        necessaryTimesB: new Map<string, NecessaryTime>([
          ["7-6", { from: 7, to: 6, necessaryTime: 4, id: "7-6" }],
          ["6-1", { from: 6, to: 1, necessaryTime: 17, id: "6-1" }],
        ]),
        stoppingStationList: [1, 6, 7],
        trainIdList: [1],
        lineColor: LINE_COLORS[0].value,
      },
    ],
  ]),
  diagramData: {
    labels: ["上野", "北千住", "松戸", "柏"],
    datasets: [
      {
        label: "特急-1",
        id: 1,
        data: [
          { time: "2021-10-14 04:30", stationId: 1 },
          { time: "2021-10-14 04:47", stationId: 6 },
          { time: "2021-10-14 04:51", stationId: 7 },
          { time: "2021-10-14 05:01", stationId: 7 },
          { time: "2021-10-14 05:05", stationId: 6 },
          { time: "2021-10-14 05:22", stationId: 1 },
        ],
        borderColor: LINE_COLORS[0].value,
      },
    ],
  },
  showingTrainId: 1,
  nextTrainId: 2,
  __chartRefresh: () => void 0,
  __saveId: 1,
};
const mockGetters = {} as MyGetters;
describe("getters", () => {
  let state: State;
  beforeEach(() => {
    state = clone(mockState);
  });
  describe("getStation", () => {
    it("normal", () => {
      const result = getters.getStation(state, mockGetters)(1);
      expect(result).toEqual({ id: 1, name: "上野", shouldRecordTime: true });
    });
  });
  describe("getShouldRecordTimeStationList", () => {
    it("normal", () => {
      const result = getters.getShouldRecordTimeStationList(state, mockGetters);
      expect(result).toEqual([
        { id: 1, name: "上野", shouldRecordTime: true },
        { id: 5, name: "北千住", shouldRecordTime: true },
        { id: 6, name: "松戸", shouldRecordTime: true },
        { id: 7, name: "柏", shouldRecordTime: true },
      ]);
    });
  });
  describe("getTerminalStation", () => {
    it("normal", () => {
      const result = getters.getTerminalStation(state, mockGetters);
      expect(result).toEqual({
        startingStationId: 1,
        endingStationId: 7,
      });
    });
  });
  describe("getTrainType", () => {
    it("normal", () => {
      const result = getters.getTrainType(state, mockGetters)(1);
      expect(result).toEqual({
        id: 1,
        name: "特急",
        necessaryTimesA: new Map<string, NecessaryTime>([
          ["1-6", { from: 1, to: 6, necessaryTime: 17, id: "1-6" }],
          ["6-7", { from: 6, to: 7, necessaryTime: 4, id: "6-7" }],
        ]),
        necessaryTimesB: new Map<string, NecessaryTime>([
          ["7-6", { from: 7, to: 6, necessaryTime: 4, id: "7-6" }],
          ["6-1", { from: 6, to: 1, necessaryTime: 17, id: "6-1" }],
        ]),
        stoppingStationList: [1, 6, 7],
        trainIdList: [1],
        lineColor: LINE_COLORS[0].value,
      });
    });
  });
  describe("getTrainTypeByTrainId", () => {
    it("normal", () => {
      const result = getters.getTrainTypeByTrainId(state, mockGetters)(1);
      expect(result).toEqual({
        id: 1,
        name: "特急",
        necessaryTimesA: new Map<string, NecessaryTime>([
          ["1-6", { from: 1, to: 6, necessaryTime: 17, id: "1-6" }],
          ["6-7", { from: 6, to: 7, necessaryTime: 4, id: "6-7" }],
        ]),
        necessaryTimesB: new Map<string, NecessaryTime>([
          ["7-6", { from: 7, to: 6, necessaryTime: 4, id: "7-6" }],
          ["6-1", { from: 6, to: 1, necessaryTime: 17, id: "6-1" }],
        ]),
        stoppingStationList: [1, 6, 7],
        trainIdList: [1],
        lineColor: LINE_COLORS[0].value,
      });
    });
  });
  describe("getChartJsData", () => {
    it("normal", () => {
      const result = getters.getChatrJsData(state, {
        getStation: (n: number) => ({
          name: `mock${n}`,
        }),
      } as unknown as MyGetters); // めっちゃ怒られそう
      expect(result).toEqual({
        labels: ["上野", "北千住", "松戸", "柏"],
        datasets: [
          {
            label: "特急-1",
            id: 1,
            data: [
              { time: "2021-10-14 04:30", stationId: 1, name: "mock1" },
              { time: "2021-10-14 04:47", stationId: 6, name: "mock6" },
              { time: "2021-10-14 04:51", stationId: 7, name: "mock7" },
              { time: "2021-10-14 05:01", stationId: 7, name: "mock7" },
              { time: "2021-10-14 05:05", stationId: 6, name: "mock6" },
              { time: "2021-10-14 05:22", stationId: 1, name: "mock1" },
            ],
            borderColor: LINE_COLORS[0].value,
          },
        ],
      });
    });
  });
  describe("getMinAndMaxTimeOnDiagramData", () => {
    it("normal", () => {
      const result = getters.getMinAndMaxTimeOnDiagramData(
        state,
        {} as MyGetters
      );
      expect(result).toEqual({
        min: "2021-10-14 04:15",
        max: "2021-10-14 05:37",
      });
    });
    it("日付またぎ", () => {
      state.diagramData.datasets[0].data.push({
        stationId: 7,
        time: "2021-10-15 02:00",
      });
      const result = getters.getMinAndMaxTimeOnDiagramData(
        state,
        {} as MyGetters
      );
      expect(result).toEqual({
        min: "2021-10-14 04:15",
        max: "2021-10-15 02:15",
      });
    });
    it("複数件-前", () => {
      state.diagramData.datasets.push({
        id: 2,
        label: "test",
        borderColor: "#FF0000",
        data: [
          {
            stationId: 1,
            time: "2021-10-14 03:50",
          },
        ],
      });
      const result = getters.getMinAndMaxTimeOnDiagramData(
        state,
        {} as MyGetters
      );
      expect(result).toEqual({
        min: "2021-10-14 03:35",
        max: "2021-10-14 05:37",
      });
    });
    it("複数件-後", () => {
      state.diagramData.datasets.push({
        id: 2,
        label: "test",
        borderColor: "#FF0000",
        data: [
          {
            stationId: 1,
            time: "2021-10-14 13:50",
          },
        ],
      });
      const result = getters.getMinAndMaxTimeOnDiagramData(
        state,
        {} as MyGetters
      );
      expect(result).toEqual({
        min: "2021-10-14 04:15",
        max: "2021-10-14 14:05",
      });
    });
  });
  describe("getTrainDiagramDataSetById", () => {
    it("normal", () => {
      const result = getters.getTrainDiagramDataSetById(state, mockGetters)(1);
      expect(result).toEqual({
        label: "特急-1",
        id: 1,
        data: [
          { time: "2021-10-14 04:30", stationId: 1 },
          { time: "2021-10-14 04:47", stationId: 6 },
          { time: "2021-10-14 04:51", stationId: 7 },
          { time: "2021-10-14 05:01", stationId: 7 },
          { time: "2021-10-14 05:05", stationId: 6 },
          { time: "2021-10-14 05:22", stationId: 1 },
        ],
        borderColor: LINE_COLORS[0].value,
      });
    });
  });
});
