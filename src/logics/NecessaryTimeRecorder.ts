import { Rap } from '@/types';

export default class NecessaryTimeRecorder {
  raps: Rap[] = [];
  stationList: string[] = [];
  constructor(stationList?: string[]) {
    if (stationList) {
      this.stationList = stationList;
    }
  }
  record(time: number, fromTo?: string) {
    
  }
}
