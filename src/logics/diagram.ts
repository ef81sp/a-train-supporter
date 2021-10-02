import {
  NecessaryTime,
  NecessaryTimeMap,
  TerminalStation,
  TrainType,
} from '@/types';
import { DiagramData } from '@/types/diagram';
import dayjs from 'dayjs';

export const formatDdHhmmToHhmm = (time: string) => {
  return dayjs(time, 'YYYY-MM-DD HH:mm').format('HH:mm');
};

export const addMinute = (time: string, addingMinutes: number) => {
  return dayjs(time, 'YYYY-MM-DD HH:mm')
    .add(addingMinutes, 'minute')
    .format('YYYY-MM-DD HH:mm');
};

export const roundMinute = (
  time: string,
  targetUnitMinutes: number
): string => {
  const parsedTime = dayjs(time, 'YYYY-MM-DD HH:mm');
  const parsedMinute = parsedTime.get('minute');
  const __targetUnitMinutes = targetUnitMinutes === 0 ? 60 : targetUnitMinutes;
  let targetMinute = __targetUnitMinutes;
  while (parsedMinute >= targetMinute) {
    targetMinute += __targetUnitMinutes;
  }
  return parsedTime.minute(targetMinute).format('YYYY-MM-DD HH:mm');
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
  startStation: string;
  endStation: string;
  turnCycleTime?: number;
  boundFor: 'A' | 'B' | 'AB' | 'BA';
  terminalStation: TerminalStation;
}) => {
  let currentTime: string = startTime;
  const result: DiagramData[] = [{ station: startStation, time: startTime }];
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
        (necessaryTime.from === terminalStation.endingStationName ||
          necessaryTime.from === terminalStation.startingStationName)
      ) {
        currentTime = roundMinute(currentTime, turnCycleTime);
        result.push({ station: necessaryTime.from, time: currentTime });
      }

      // 追加
      currentTime = addMinute(currentTime, necessaryTime.necessaryTime);
      result.push({ station: necessaryTime.to, time: currentTime });

      // 終点の場合抜ける
      if (
        // 往路でendStationについても抜けない
        (roundTripStatus !== ROUND_TRIP_STATUS.ROUND_TRIP_OUTWARD &&
          necessaryTime.to === endStation) ||
        necessaryTime.to === terminalStation.endingStationName ||
        necessaryTime.to === terminalStation.startingStationName
      )
        return;

      // 停車駅の場合は1分追加する
      if (trainType.stoppingStationList.includes(necessaryTime.to)) {
        currentTime = addMinute(currentTime, 1);
        result.push({ station: necessaryTime.to, time: currentTime });
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
