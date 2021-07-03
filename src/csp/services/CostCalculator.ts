import { CurrentSchedule } from '../models';
import { SoftConstraint, dayNumber} from '../types';

export class CostCalculator {

  private periods: number[][];
  private course: string;
  private instructor: string;

  constructor(periods: number[][], course: string, instructor: string) {
    this.periods = periods;
    this.course = course;
    this.instructor = instructor;
  };

  calculate = (currentSchedule: CurrentSchedule, softConstraints: SoftConstraint[]): number => {
    return softConstraints.reduce(
      (accumalator, softConstraint) => {
        return (
          accumalator +
          softConstraint.priority *
            this[softConstraint.type](currentSchedule, softConstraint.param)
        );
      },
      0
    );
  };

  private minDays = (currentSchedule: CurrentSchedule, internalWieght = 1) => {
    let addedDaysCount = 0;
    const busyDays = new Array(6).fill(false);
    for (let i = 0; i < 6; i++) {
      for (let j = i * 12; j < i * 12 + 12; j++) {
        if (currentSchedule.schedule[j]) {
          busyDays[i] = true;
          break;
        }
      }
    }

    this.periods.forEach((period) => {
      let dayIndex = Math.floor(period[0] / 12);
      if (!busyDays[dayIndex]) {
        addedDaysCount++;
        busyDays[dayIndex] = true;
      }
    });
    return addedDaysCount * internalWieght;
  };

  private maxDays = (currentSchedule: CurrentSchedule, internalWieght = 1) => {
    return -this.minDays(currentSchedule) * internalWieght;
  };

  private earlyPeriods = (_currentSchedule: CurrentSchedule, internalWieght = 1 / 5) => {
    let earliness = 0;
    this.periods.forEach((period) => {
      const day = Math.floor(period[0] / 12),
        from = period[0] - 12 * day + 1;

      earliness += from;
    });

    return earliness * internalWieght;
  };

  private latePeriods = (currentSchedule: CurrentSchedule, internalWieght = 1 / 5) => {
    return -this.earlyPeriods(currentSchedule) * internalWieght;
  };

  private gaps = (currentSchedule: CurrentSchedule, internalWieght = 1 / 3) => {
    let gaps = 0;
    let schedule = [...currentSchedule.schedule];
    let periodDays: number[] = [];

    this.periods.forEach((period) => {
      const day = Math.floor(period[0] / 12),
        from = period[0],
        to = period[1];

      for (let i = from; i <= to; i++) schedule[i] = true;

      periodDays.push(day);
    });

    periodDays.forEach((day) => {
      let firstPeriod = day * 12 + 11,
        lastPeriod = day * 12;

      for (let i = day * 12; i < day * 12 + 12; i++) {
        if (schedule[i]) {
          if (firstPeriod > i) firstPeriod = i;
          if (lastPeriod < i) lastPeriod = i;
        }
      }

      for (let i = firstPeriod; i < lastPeriod; i++) if (!schedule[i]) gaps++;
    });
    return gaps * internalWieght;
  };

  private gapsPlus = (currentSchedule: CurrentSchedule, internalWieght = 1 / 3) => {
    return -this.gaps(currentSchedule) * internalWieght;
  };

  private daysOff = (
    currentSchedule: CurrentSchedule,
    days: string[],
    internalWieght = 3
  ) => {
    console.log("daysoff", days);
    const busyDays = new Array(6).fill(false);
    for (let i = 0; i < 6; i++) {
      for (let j = i * 12; j < i * 12 + 12; j++) {
        if (currentSchedule.schedule[j]) {
          busyDays[i] = true;
          break;
        }
      }
    }

    let hits = 0;
    for (let i = 0; i < days.length; i++) {
      for (let j = 0; j < this.periods.length; j++) {
        const period = this.periods[j];
        let dayIndex = Math.floor(period[0] / 12);
        console.log(dayNumber[days[i]]);
        if (dayIndex === dayNumber[days[i]] && !busyDays[i]) {
          hits++;
          break;
        }
      }
    }

    return hits * internalWieght;
  };

  private courseInstructor = (
    _currentSchedule: CurrentSchedule,
    instructors: any,
    internalWieght = 2
  ) => {
    if ( !this.instructor ||
      !instructors[this.course] ||
      this.instructor === instructors[this.course]
    )
      return 0;
    return 1 * internalWieght;
  };

  clone = () => {
    let clonedCostCalc = Object.assign(new CostCalculator([], null, null), JSON.parse(JSON.stringify(this)))
    return clonedCostCalc
  }
};
