import { TerminalStation, TrainType } from '@/types';
import { DiagramData } from '@/types/diagram';
import dayjs from 'dayjs';

export const formatDdHhmmToHhmm = (time: string) => {
  return dayjs(`2021-10-${time}`, 'YYYY-MM-DD HH:mm').format('HH:mm');
};

export const addMinute = (time: string, addingMinutes: number) => {
  return dayjs(`2021-10-${time}`, 'YYYY-MM-DD HH:mm')
    .add(addingMinutes, 'minute')
    .format('DD HH:mm');
};

export const generateChartData = (
  startTime: string,
  trainType: TrainType,
  terminalStation: TerminalStation
) => {
  let currentTime: string = startTime;
  const result: DiagramData[] = [];
  trainType.necessaryTimes.forEach((necessaryTime) => {
    if (result.length === 0) {
      result.push({ time: currentTime, station: necessaryTime.from });
    } else if (
      necessaryTime.from === terminalStation.startingStationName ||
      necessaryTime.from === terminalStation.endingStationName
    ) {
      currentTime = addMinute(currentTime, 10);
      result.push({ time: currentTime, station: necessaryTime.from });
    }

    currentTime = addMinute(currentTime, necessaryTime.necessaryTime);
    result.push({ time: currentTime, station: necessaryTime.to });
  });
  return result;
};
