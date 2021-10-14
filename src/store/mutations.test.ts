import { State } from ".";
import rfdc from "rfdc";
const clone = rfdc();
import { mutations } from "./mutations";
import { NecessaryTime, TrainType } from "@/types";
import { LINE_COLORS } from "@/common/const";

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

describe("getters", () => {
  let state: State;
  beforeEach(() => {
    state = clone(mockState);
  });
  describe("updateStationList", () => {
    it("normal", () => {
      mutations.updateStationList(state, [
        { id: 1, name: "上野", shouldRecordTime: true },
        { id: 2, name: "日暮里", shouldRecordTime: false },
      ]);
      expect(state.stationList).toEqual({
        stations: [
          { id: 1, name: "上野", shouldRecordTime: true },
          { id: 2, name: "日暮里", shouldRecordTime: false },
        ],
        startingStationId: 1,
        endingStationId: 2,
      });
      expect(state.stationList.startingStationId).toBe(1);
      expect(state.stationList.endingStationId).toBe(2);
    });
  });
  describe("updateTrainTypeNecessaryTimeTable", () => {
    it("A", () => {
      mutations.updateTrainTypeNecessaryTimeTable(state, {
        trainTypeId: 1,
        boundFor: "A",
        newNecessaryTimeMap: new Map<string, NecessaryTime>([
          ["1-6", { from: 1, to: 6, necessaryTime: 20, id: "1-6" }],
          ["6-7", { from: 6, to: 7, necessaryTime: 5, id: "6-7" }],
        ]),
      });
      expect(state.trainTypes.get(1)?.necessaryTimesA).toEqual(
        new Map<string, NecessaryTime>([
          ["1-6", { from: 1, to: 6, necessaryTime: 20, id: "1-6" }],
          ["6-7", { from: 6, to: 7, necessaryTime: 5, id: "6-7" }],
        ])
      );
    });
    it("B", () => {
      mutations.updateTrainTypeNecessaryTimeTable(state, {
        trainTypeId: 1,
        boundFor: "B",
        newNecessaryTimeMap: new Map<string, NecessaryTime>([
          ["1-6", { from: 1, to: 6, necessaryTime: 20, id: "1-6" }],
          ["6-7", { from: 6, to: 7, necessaryTime: 5, id: "6-7" }],
        ]),
      });
      expect(state.trainTypes.get(1)?.necessaryTimesB).toEqual(
        new Map<string, NecessaryTime>([
          ["1-6", { from: 1, to: 6, necessaryTime: 20, id: "1-6" }],
          ["6-7", { from: 6, to: 7, necessaryTime: 5, id: "6-7" }],
        ])
      );
    });
  });
  describe("updateDiagramData", () => {
    it("normal", () => {
      mutations.updateDiagramData(state, {
        id: 1,
        data: [
          { time: "2021-10-14 04:47", stationId: 6 },
          { time: "2021-10-14 04:47", stationId: 6 },
          { time: "2021-10-14 04:30", stationId: 1 },
          { time: "2021-10-14 04:51", stationId: 7 },
        ],
      });
      expect(state.diagramData.datasets[0].data).toEqual([
        { time: "2021-10-14 04:30", stationId: 1 },
        { time: "2021-10-14 04:47", stationId: 6 },
        { time: "2021-10-14 04:51", stationId: 7 },
      ]);
    });
  });
  describe("setShowingTrainId", () => {
    it("normal", () => {
      mutations.setShowingTrainId(state, { id: 5 });
      expect(state.showingTrainId).toBe(5);
    });
  });
  describe("addInitialTrainType", () => {
    it("normal", () => {
      mutations.addInitialTrainType(state);
      expect(state.trainTypes.has(2)).toBe(true);
      expect(state.trainTypes.get(2)?.id).toBe(2);
    });
  });
  describe("updateTrainType", () => {
    it("normal", () => {
      const newTrainType = {
        id: 1,
        name: "快特",
        necessaryTimesA: new Map<string, NecessaryTime>([
          ["1-6", { from: 1, to: 6, necessaryTime: 17, id: "1-6" }],
          ["6-7", { from: 6, to: 7, necessaryTime: 4, id: "6-7" }],
        ]),
        necessaryTimesB: new Map<string, NecessaryTime>([
          ["7-6", { from: 7, to: 6, necessaryTime: 4, id: "7-6" }],
          ["6-1", { from: 6, to: 1, necessaryTime: 17, id: "6-1" }],
        ]),
        stoppingStationList: [1, 3, 6, 7],
        trainIdList: [1, 3],
        lineColor: LINE_COLORS[3].value,
      };
      mutations.updateTrainType(state, { id: 1, data: newTrainType });
      expect(state.trainTypes.get(1)).toEqual(newTrainType);
    });
  });
  describe("addTrain", () => {
    it("normal", () => {
      expect(state.diagramData.datasets.length).toBe(1);
      mutations.addTrain(state, { trainTypeId: 1, trainId: 8 });
      expect(state.diagramData.datasets.length).toBe(2);
      expect(state.diagramData.datasets[1].id).toBe(8);
    });
  });
  describe("incrementTrainId", () => {
    it("normal", () => {
      mutations.incrementTrainId(state);
      expect(state.nextTrainId).toBe(3);
    });
  });
  describe("setChartRefresh", () => {
    it("normal", () => {
      const func = () => void 0;
      mutations.setChartRefresh(state, { chartRefresh: func });
      expect(state.__chartRefresh).toEqual(func);
    });
  });
});
