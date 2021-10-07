import { DATE_FORMAT, LINE_COLORS } from '@/common/const';
import {
  NecessaryTime,
  NecessaryTimeMap,
  stationId,
  StationList,
  TerminalStation,
  TrainType,
  TrainTypeMap,
} from '@/types';
import { DiagramData } from '@/types/diagram';
import dayjs from 'dayjs';
import clonedeep from 'lodash.clonedeep';

export const formatDdHhmmToHhmm = (time: string) => {
  return dayjs(time, DATE_FORMAT).format('HH:mm');
};

export const addMinute = (time: string, addingMinutes: number) => {
  return dayjs(time, DATE_FORMAT)
    .add(addingMinutes, 'minute')
    .format(DATE_FORMAT);
};

export const roundMinute = (
  time: string,
  targetUnitMinutes: number
): string => {
  const parsedTime = dayjs(time, DATE_FORMAT);
  const parsedMinute = parsedTime.get('minute');
  const __targetUnitMinutes = targetUnitMinutes === 0 ? 60 : targetUnitMinutes;
  let targetMinute = __targetUnitMinutes;
  while (parsedMinute >= targetMinute) {
    targetMinute += __targetUnitMinutes;
  }
  return parsedTime.minute(targetMinute).format(DATE_FORMAT);
};

export const generateChartData = ({
  startTime,
  trainType,
  startStation,
  endStation,
  turnCycleTime = 30,
  boundFor,
  terminalStation,
}: {
  startTime: string;
  trainType: TrainType;
  startStation: stationId;
  endStation: stationId;
  turnCycleTime?: number;
  boundFor: 'A' | 'B' | 'AB' | 'BA';
  terminalStation: TerminalStation;
}) => {
  let currentTime: string = startTime;
  const result: DiagramData[] = [{ stationId: startStation, time: startTime }];
  enum ROUND_TRIP_STATUS {
    ONE_WAY,
    ROUND_TRIP_OUTWARD,
    ROUND_TRIP_HOMEWORD,
  }
  const loopNecessaryTimes = (
    necessaryTimes: NecessaryTimeMap,
    roundTripStatus: ROUND_TRIP_STATUS
  ) => {
    let isStart = false;
    for (const [, necessaryTime] of necessaryTimes) {
      // 初期処理
      if (
        necessaryTime.from === startStation ||
        roundTripStatus === ROUND_TRIP_STATUS.ROUND_TRIP_HOMEWORD
      ) {
        isStart = true;
      }
      if (!isStart && necessaryTime.from !== startStation) {
        continue;
      }

      // 復路の最初の駅は指定された待機時間ぶん追加する
      if (
        roundTripStatus === ROUND_TRIP_STATUS.ROUND_TRIP_HOMEWORD &&
        (necessaryTime.from === terminalStation.endingStationId ||
          necessaryTime.from === terminalStation.startingStationId)
      ) {
        currentTime = roundMinute(currentTime, turnCycleTime);
        result.push({ stationId: necessaryTime.from, time: currentTime });
      }

      // 追加
      currentTime = addMinute(currentTime, necessaryTime.necessaryTime);
      result.push({ stationId: necessaryTime.to, time: currentTime });

      // 終点の場合抜ける
      if (
        // 往路でendStationについても抜けない
        (roundTripStatus !== ROUND_TRIP_STATUS.ROUND_TRIP_OUTWARD &&
          necessaryTime.to === endStation) ||
        necessaryTime.to === terminalStation.endingStationId ||
        necessaryTime.to === terminalStation.startingStationId
      )
        return;

      // 停車駅の場合は1分追加する
      if (trainType.stoppingStationList.includes(necessaryTime.to)) {
        currentTime = addMinute(currentTime, 1);
        result.push({ stationId: necessaryTime.to, time: currentTime });
      }
    }
  };

  switch (boundFor) {
    case 'A': {
      loopNecessaryTimes(trainType.necessaryTimesA, ROUND_TRIP_STATUS.ONE_WAY);
      break;
    }
    case 'B': {
      loopNecessaryTimes(trainType.necessaryTimesB, ROUND_TRIP_STATUS.ONE_WAY);
      break;
    }
    case 'AB': {
      loopNecessaryTimes(
        trainType.necessaryTimesA,
        ROUND_TRIP_STATUS.ROUND_TRIP_OUTWARD
      );
      loopNecessaryTimes(
        trainType.necessaryTimesB,
        ROUND_TRIP_STATUS.ROUND_TRIP_HOMEWORD
      );
      break;
    }
    case 'BA': {
      loopNecessaryTimes(
        trainType.necessaryTimesB,
        ROUND_TRIP_STATUS.ROUND_TRIP_OUTWARD
      );
      loopNecessaryTimes(
        trainType.necessaryTimesA,
        ROUND_TRIP_STATUS.ROUND_TRIP_HOMEWORD
      );
      break;
    }
  }

  return result;
};

export const generateInitialNecessaryTime = (
  stationList: StationList,
  boundFor: 'A' | 'B'
): NecessaryTimeMap => {
  const result: NecessaryTimeMap = new Map();
  const list = clonedeep(stationList.stations);
  if (boundFor === 'B') {
    list.reverse();
  }
  let previousStationId: stationId = list[0].id;
  list.forEach((station, idx) => {
    if (idx === 0) return;
    if (!station.shouldRecordTime) return;
    const id = `${previousStationId}-${station.id}`;
    const item: NecessaryTime = {
      id,
      from: previousStationId,
      to: station.id,
      necessaryTime: 0,
    };
    result.set(id, item);
    previousStationId = station.id;
  });
  return result;
};

export const getRandomLineColor = (trainTypes: TrainTypeMap) => {
  const usedColors = [...trainTypes.values()].map(
    (trainType) => trainType.lineColor
  );
  const colors = LINE_COLORS.filter((v) => !usedColors.includes(v.value));
  return colors[Math.floor(Math.random() * colors.length)];
};
