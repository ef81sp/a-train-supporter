import {
  NecessaryTime,
  NecessaryTimeMap,
  StationList,
  TerminalStation,
  TrainType,
} from '@/types';
import { DiagramData } from '@/types/diagram';
import {
  roundMinute,
  generateChartData,
  generateInitialNecessaryTime,
} from './diagram';

describe('roundMinute', () => {
  it('通常', () => {
    const resultA = roundMinute('2021-10-14 16:17', 5);
    const resultB = roundMinute('2021-10-14 16:17', 30);

    expect(resultA).toBe('2021-10-14 16:20');
    expect(resultB).toBe('2021-10-14 16:30');
  });
  it('繰り上がりをまたいでもいける', () => {
    const resultA = roundMinute('2021-10-14 16:58', 5);
    const resultB = roundMinute('2021-10-14 16:58', 30);

    expect(resultA).toBe('2021-10-14 17:00');
    expect(resultB).toBe('2021-10-14 17:00');
  });
  it('0を指定したときは60とみなす', () => {
    const result = roundMinute('2021-10-14 16:17', 0);
    expect(result).toBe('2021-10-14 17:00');
  });
  it('60より大きい数字をもらってもいける', () => {
    const resultA = roundMinute('2021-10-14 16:17', 80);
    const resultB = roundMinute('2021-10-14 16:17', 210);
    expect(resultA).toBe('2021-10-14 17:20');
    expect(resultB).toBe('2021-10-14 19:30');
  });
});

describe('generateChartData', () => {
  const trainType: TrainType = {
    id: 1,
    name: '特急',
    necessaryTimesA: new Map<string, NecessaryTime>([
      ['1-6', { from: 1, to: 6, necessaryTime: 17, id: '1-6' }],
      ['6-7', { from: 6, to: 7, necessaryTime: 4, id: '6-7' }],
      ['7-8', { from: 7, to: 8, necessaryTime: 25, id: '7-8' }],
    ]),
    necessaryTimesB: new Map<string, NecessaryTime>([
      ['8-7', { from: 8, to: 7, necessaryTime: 24, id: '8-7' }],
      ['7-6', { from: 7, to: 6, necessaryTime: 4, id: '7-6' }],
      ['6-1', { from: 6, to: 1, necessaryTime: 17, id: '6-1' }],
    ]),
    stoppingStationList: [1, 7, 8],
    trainIdList: [],
    lineColor: '#000000',
  };
  const startTime = '2021-10-14 04:30';
  const terminalStation: TerminalStation = {
    startingStationId: 1,
    endingStationId: 8,
  };

  describe('片道', () => {
    it('全区間 - A', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: 1,
        endStation: 8,
        boundFor: 'A',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 1, time: '2021-10-14 04:30' },
        { stationId: 6, time: '2021-10-14 04:47' },
        { stationId: 7, time: '2021-10-14 04:51' },
        { stationId: 7, time: '2021-10-14 04:52' },
        { stationId: 8, time: '2021-10-14 05:17' },
      ]);
    });
    it('全区間 - B', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: 8,
        endStation: 1,
        boundFor: 'B',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 8, time: '2021-10-14 04:30' },
        { stationId: 7, time: '2021-10-14 04:54' },
        { stationId: 7, time: '2021-10-14 04:55' },
        { stationId: 6, time: '2021-10-14 04:59' },
        { stationId: 1, time: '2021-10-14 05:16' },
      ]);
    });
    it('途中まで - A', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: 1,
        endStation: 7,
        boundFor: 'A',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 1, time: '2021-10-14 04:30' },
        { stationId: 6, time: '2021-10-14 04:47' },
        { stationId: 7, time: '2021-10-14 04:51' },
      ]);
    });
    it('途中まで - B', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: 8,
        endStation: 7,
        boundFor: 'B',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 8, time: '2021-10-14 04:30' },
        { stationId: 7, time: '2021-10-14 04:54' },
      ]);
    });
    it('途中から- A', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: 7,
        endStation: 8,
        boundFor: 'A',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 7, time: '2021-10-14 04:30' },
        { stationId: 8, time: '2021-10-14 04:55' },
      ]);
    });
    it('途中から - B', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: 7,
        endStation: 1,
        boundFor: 'B',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 7, time: '2021-10-14 04:30' },
        { stationId: 6, time: '2021-10-14 04:34' },
        { stationId: 1, time: '2021-10-14 04:51' },
      ]);
    });
  });
  describe('往復', () => {
    it('全区間 - AB', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: 1,
        endStation: 1,
        boundFor: 'AB',
      });
      expect(result).toEqual([
        { stationId: 1, time: '2021-10-14 04:30' },
        { stationId: 6, time: '2021-10-14 04:47' },
        { stationId: 7, time: '2021-10-14 04:51' },
        { stationId: 7, time: '2021-10-14 04:52' },
        { stationId: 8, time: '2021-10-14 05:17' },
        { stationId: 8, time: '2021-10-14 05:30' },
        { stationId: 7, time: '2021-10-14 05:54' },
        { stationId: 7, time: '2021-10-14 05:55' },
        { stationId: 6, time: '2021-10-14 05:59' },
        { stationId: 1, time: '2021-10-14 06:16' },
      ]);
    });
    it('全区間 - BA', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: 8,
        endStation: 8,
        boundFor: 'BA',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 8, time: '2021-10-14 04:30' },
        { stationId: 7, time: '2021-10-14 04:54' },
        { stationId: 7, time: '2021-10-14 04:55' },
        { stationId: 6, time: '2021-10-14 04:59' },
        { stationId: 1, time: '2021-10-14 05:16' },
        { stationId: 1, time: '2021-10-14 05:30' },
        { stationId: 6, time: '2021-10-14 05:47' },
        { stationId: 7, time: '2021-10-14 05:51' },
        { stationId: 7, time: '2021-10-14 05:52' },
        { stationId: 8, time: '2021-10-14 06:17' },
      ]);
    });
    it('端から途中まで - AB', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: 1,
        endStation: 7,
        boundFor: 'AB',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 1, time: '2021-10-14 04:30' },
        { stationId: 6, time: '2021-10-14 04:47' },
        { stationId: 7, time: '2021-10-14 04:51' },
        { stationId: 7, time: '2021-10-14 04:52' },
        { stationId: 8, time: '2021-10-14 05:17' },
        { stationId: 8, time: '2021-10-14 05:30' },
        { stationId: 7, time: '2021-10-14 05:54' },
      ]);
    });
    it('端から途中まで - BA', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: 8,
        endStation: 7,
        boundFor: 'BA',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 8, time: '2021-10-14 04:30' },
        { stationId: 7, time: '2021-10-14 04:54' },
        { stationId: 7, time: '2021-10-14 04:55' },
        { stationId: 6, time: '2021-10-14 04:59' },
        { stationId: 1, time: '2021-10-14 05:16' },
        { stationId: 1, time: '2021-10-14 05:30' },
        { stationId: 6, time: '2021-10-14 05:47' },
        { stationId: 7, time: '2021-10-14 05:51' },
      ]);
    });
    it('途中から端まで - AB', () => {
      const result = generateChartData({
        startTime: '2021-10-14 04:52',
        trainType,
        terminalStation,
        startStation: 7,
        endStation: 1,
        boundFor: 'AB',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 7, time: '2021-10-14 04:52' },
        { stationId: 8, time: '2021-10-14 05:17' },
        { stationId: 8, time: '2021-10-14 05:30' },
        { stationId: 7, time: '2021-10-14 05:54' },
        { stationId: 7, time: '2021-10-14 05:55' },
        { stationId: 6, time: '2021-10-14 05:59' },
        { stationId: 1, time: '2021-10-14 06:16' },
      ]);
    });
    it('途中から端まで - BA', () => {
      const result = generateChartData({
        startTime: '2021-10-14 04:55',
        trainType,
        terminalStation,
        startStation: 7,
        endStation: 8,
        boundFor: 'BA',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 7, time: '2021-10-14 04:55' },
        { stationId: 6, time: '2021-10-14 04:59' },
        { stationId: 1, time: '2021-10-14 05:16' },
        { stationId: 1, time: '2021-10-14 05:30' },
        { stationId: 6, time: '2021-10-14 05:47' },
        { stationId: 7, time: '2021-10-14 05:51' },
        { stationId: 7, time: '2021-10-14 05:52' },
        { stationId: 8, time: '2021-10-14 06:17' },
      ]);
    });
    it('途中から途中まで - AB', () => {
      const result = generateChartData({
        startTime: '2021-10-14 04:52',
        trainType,
        terminalStation,
        startStation: 7,
        endStation: 7,
        boundFor: 'AB',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 7, time: '2021-10-14 04:52' },
        { stationId: 8, time: '2021-10-14 05:17' },
        { stationId: 8, time: '2021-10-14 05:30' },
        { stationId: 7, time: '2021-10-14 05:54' },
      ]);
    });
    it('途中から途中まで - BA', () => {
      const result = generateChartData({
        startTime: '2021-10-14 04:55',
        trainType,
        terminalStation,
        startStation: 7,
        endStation: 7,
        boundFor: 'BA',
      });
      expect(result).toEqual<DiagramData[]>([
        { stationId: 7, time: '2021-10-14 04:55' },
        { stationId: 6, time: '2021-10-14 04:59' },
        { stationId: 1, time: '2021-10-14 05:16' },
        { stationId: 1, time: '2021-10-14 05:30' },
        { stationId: 6, time: '2021-10-14 05:47' },
        { stationId: 7, time: '2021-10-14 05:51' },
      ]);
    });
  });
});

describe('generateInitialNecessaryTime', () => {
  const stationList: StationList = {
    stations: [
      { id: 1, name: '上野', shouldRecordTime: true },
      { id: 2, name: '日暮里', shouldRecordTime: false },
      { id: 3, name: '三河島', shouldRecordTime: true },
      { id: 4, name: '南千住', shouldRecordTime: false },
      { id: 5, name: '北千住', shouldRecordTime: true },
      { id: 6, name: '松戸', shouldRecordTime: false },
      { id: 7, name: '柏', shouldRecordTime: true },
    ],
    startingStationId: 1,
    endingStationId: 7,
  };
  const expectedNecessaryTimesA: NecessaryTimeMap = new Map<
    string,
    NecessaryTime
  >([
    ['1-3', { from: 1, to: 3, necessaryTime: 0, id: '1-3' }],
    ['3-5', { from: 3, to: 5, necessaryTime: 0, id: '3-5' }],
    ['5-7', { from: 5, to: 7, necessaryTime: 0, id: '5-7' }],
  ]);
  const expectedNecessaryTimesB: NecessaryTimeMap = new Map<
    string,
    NecessaryTime
  >([
    ['7-5', { from: 7, to: 5, necessaryTime: 0, id: '7-5' }],
    ['5-3', { from: 5, to: 3, necessaryTime: 0, id: '5-3' }],
    ['3-1', { from: 3, to: 1, necessaryTime: 0, id: '3-1' }],
  ]);
  it('bound for A', () => {
    const result = generateInitialNecessaryTime(stationList, 'A');
    expect(result).toEqual<NecessaryTimeMap>(expectedNecessaryTimesA);
  });
  it('bound for B', () => {
    const result = generateInitialNecessaryTime(stationList, 'B');
    expect(result).toEqual<NecessaryTimeMap>(expectedNecessaryTimesB);
  });
});
