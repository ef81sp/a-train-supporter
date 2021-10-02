import { NecessaryTime, TrainType } from '@/types';
import { roundMinute, generateChartData } from './diagram';

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
      [
        '上野-松戸',
        { from: '上野', to: '松戸', necessaryTime: 17, id: '上野-松戸' },
      ],
      ['松戸-柏', { from: '松戸', to: '柏', necessaryTime: 4, id: '松戸-柏' }],
      ['柏-土浦', { from: '柏', to: '土浦', necessaryTime: 25, id: '柏-土浦' }],
    ]),
    necessaryTimesB: new Map<string, NecessaryTime>([
      ['土浦-柏', { from: '土浦', to: '柏', necessaryTime: 24, id: '土浦-柏' }],
      ['柏-松戸', { from: '柏', to: '松戸', necessaryTime: 4, id: '柏-松戸' }],
      [
        '松戸-上野',
        { from: '松戸', to: '上野', necessaryTime: 17, id: '松戸-上野' },
      ],
    ]),
    stoppingStationList: ['上野', '柏', '土浦'],
  };
  const startTime = '2021-10-14 04:30';
  const terminalStation = {
    startingStationName: '上野',
    endingStationName: '土浦',
  };

  describe('片道', () => {
    it('全区間 - A', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: '上野',
        endStation: '土浦',
        boundFor: 'A',
      });
      expect(result).toEqual([
        { station: '上野', time: '2021-10-14 04:30' },
        { station: '松戸', time: '2021-10-14 04:47' },
        { station: '柏', time: '2021-10-14 04:51' },
        { station: '柏', time: '2021-10-14 04:52' },
        { station: '土浦', time: '2021-10-14 05:17' },
      ]);
    });
    it('全区間 - B', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: '土浦',
        endStation: '上野',
        boundFor: 'B',
      });
      expect(result).toEqual([
        { station: '土浦', time: '2021-10-14 04:30' },
        { station: '柏', time: '2021-10-14 04:54' },
        { station: '柏', time: '2021-10-14 04:55' },
        { station: '松戸', time: '2021-10-14 04:59' },
        { station: '上野', time: '2021-10-14 05:16' },
      ]);
    });
    it('途中まで - A', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: '上野',
        endStation: '柏',
        boundFor: 'A',
      });
      expect(result).toEqual([
        { station: '上野', time: '2021-10-14 04:30' },
        { station: '松戸', time: '2021-10-14 04:47' },
        { station: '柏', time: '2021-10-14 04:51' },
      ]);
    });
    it('途中まで - B', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: '土浦',
        endStation: '柏',
        boundFor: 'B',
      });
      expect(result).toEqual([
        { station: '土浦', time: '2021-10-14 04:30' },
        { station: '柏', time: '2021-10-14 04:54' },
      ]);
    });
    it('途中から- A', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: '柏',
        endStation: '土浦',
        boundFor: 'A',
      });
      expect(result).toEqual([
        { station: '柏', time: '2021-10-14 04:30' },
        { station: '土浦', time: '2021-10-14 04:55' },
      ]);
    });
    it('途中から - B', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: '柏',
        endStation: '上野',
        boundFor: 'B',
      });
      expect(result).toEqual([
        { station: '柏', time: '2021-10-14 04:30' },
        { station: '松戸', time: '2021-10-14 04:34' },
        { station: '上野', time: '2021-10-14 04:51' },
      ]);
    });
  });
  describe('往復', () => {
    it('全区間 - AB', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: '上野',
        endStation: '上野',
        boundFor: 'AB',
      });
      expect(result).toEqual([
        { station: '上野', time: '2021-10-14 04:30' },
        { station: '松戸', time: '2021-10-14 04:47' },
        { station: '柏', time: '2021-10-14 04:51' },
        { station: '柏', time: '2021-10-14 04:52' },
        { station: '土浦', time: '2021-10-14 05:17' },
        { station: '土浦', time: '2021-10-14 05:30' },
        { station: '柏', time: '2021-10-14 05:54' },
        { station: '柏', time: '2021-10-14 05:55' },
        { station: '松戸', time: '2021-10-14 05:59' },
        { station: '上野', time: '2021-10-14 06:16' },
      ]);
    });
    it('全区間 - BA', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: '土浦',
        endStation: '土浦',
        boundFor: 'BA',
      });
      expect(result).toEqual([
        { station: '土浦', time: '2021-10-14 04:30' },
        { station: '柏', time: '2021-10-14 04:54' },
        { station: '柏', time: '2021-10-14 04:55' },
        { station: '松戸', time: '2021-10-14 04:59' },
        { station: '上野', time: '2021-10-14 05:16' },
        { station: '上野', time: '2021-10-14 05:30' },
        { station: '松戸', time: '2021-10-14 05:47' },
        { station: '柏', time: '2021-10-14 05:51' },
        { station: '柏', time: '2021-10-14 05:52' },
        { station: '土浦', time: '2021-10-14 06:17' },
      ]);
    });
    it('端から途中まで - AB', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: '上野',
        endStation: '柏',
        boundFor: 'AB',
      });
      expect(result).toEqual([
        { station: '上野', time: '2021-10-14 04:30' },
        { station: '松戸', time: '2021-10-14 04:47' },
        { station: '柏', time: '2021-10-14 04:51' },
        { station: '柏', time: '2021-10-14 04:52' },
        { station: '土浦', time: '2021-10-14 05:17' },
        { station: '土浦', time: '2021-10-14 05:30' },
        { station: '柏', time: '2021-10-14 05:54' },
      ]);
    });
    it('端から途中まで - BA', () => {
      const result = generateChartData({
        startTime,
        trainType,
        terminalStation,
        startStation: '土浦',
        endStation: '柏',
        boundFor: 'BA',
      });
      expect(result).toEqual([
        { station: '土浦', time: '2021-10-14 04:30' },
        { station: '柏', time: '2021-10-14 04:54' },
        { station: '柏', time: '2021-10-14 04:55' },
        { station: '松戸', time: '2021-10-14 04:59' },
        { station: '上野', time: '2021-10-14 05:16' },
        { station: '上野', time: '2021-10-14 05:30' },
        { station: '松戸', time: '2021-10-14 05:47' },
        { station: '柏', time: '2021-10-14 05:51' },
      ]);
    });
    it('途中から端まで - AB', () => {
      const result = generateChartData({
        startTime: '2021-10-14 04:52',
        trainType,
        terminalStation,
        startStation: '柏',
        endStation: '上野',
        boundFor: 'AB',
      });
      expect(result).toEqual([
        { station: '柏', time: '2021-10-14 04:52' },
        { station: '土浦', time: '2021-10-14 05:17' },
        { station: '土浦', time: '2021-10-14 05:30' },
        { station: '柏', time: '2021-10-14 05:54' },
        { station: '柏', time: '2021-10-14 05:55' },
        { station: '松戸', time: '2021-10-14 05:59' },
        { station: '上野', time: '2021-10-14 06:16' },
      ]);
    });
    it('途中から端まで - BA', () => {
      const result = generateChartData({
        startTime: '2021-10-14 04:55',
        trainType,
        terminalStation,
        startStation: '柏',
        endStation: '土浦',
        boundFor: 'BA',
      });
      expect(result).toEqual([
        { station: '柏', time: '2021-10-14 04:55' },
        { station: '松戸', time: '2021-10-14 04:59' },
        { station: '上野', time: '2021-10-14 05:16' },
        { station: '上野', time: '2021-10-14 05:30' },
        { station: '松戸', time: '2021-10-14 05:47' },
        { station: '柏', time: '2021-10-14 05:51' },
        { station: '柏', time: '2021-10-14 05:52' },
        { station: '土浦', time: '2021-10-14 06:17' },
      ]);
    });
    it('途中から途中まで - AB', () => {
      const result = generateChartData({
        startTime: '2021-10-14 04:52',
        trainType,
        terminalStation,
        startStation: '柏',
        endStation: '柏',
        boundFor: 'AB',
      });
      expect(result).toEqual([
        { station: '柏', time: '2021-10-14 04:52' },
        { station: '土浦', time: '2021-10-14 05:17' },
        { station: '土浦', time: '2021-10-14 05:30' },
        { station: '柏', time: '2021-10-14 05:54' },
      ]);
    });
    it('途中から途中まで - BA', () => {
      const result = generateChartData({
        startTime: '2021-10-14 04:55',
        trainType,
        terminalStation,
        startStation: '柏',
        endStation: '柏',
        boundFor: 'BA',
      });
      expect(result).toEqual([
        { station: '柏', time: '2021-10-14 04:55' },
        { station: '松戸', time: '2021-10-14 04:59' },
        { station: '上野', time: '2021-10-14 05:16' },
        { station: '上野', time: '2021-10-14 05:30' },
        { station: '松戸', time: '2021-10-14 05:47' },
        { station: '柏', time: '2021-10-14 05:51' },
      ]);
    });
  });
});
