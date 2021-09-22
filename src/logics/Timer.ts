import dayjs, { Dayjs } from 'dayjs';

export default class Timer {
  now: Dayjs;
  multiplyer = 1;
  intervalId?: number;
  constructor(multiplyer: number) {
    this.now = dayjs('2000-10-14 00:00:00.000');
    this.multiplyer = multiplyer;
  }
  start() {
    this.intervalId = setInterval(() => {
      this.bump();
    }, 10);
  }
  stop() {
    clearInterval(this.intervalId);
  }
  reset() {
    this.now = dayjs('2000-10-14 00:00:00.000');
  }
  private bump() {
    this.now = this.now.add(10 * this.multiplyer, 'ms');
  }
}
