import { CurrentSchedule } from '.';
import { Period, SoftConstraint } from '../types';

const dayNumber = {
  saturday: 0,
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
} as const;

interface PeriodsIds {
  tutorial: string | null | undefined;
  lab: string | null | undefined;
};

export class CourseGroup {
  periods: number[][];
  weight: number;
  periodsIds: PeriodsIds;
  groupNum: string;
  discardingCounter: number;

  constructor(groupNum: string, group: Period[]) {
    this.groupNum = groupNum;
    group = group.filter((period: Period) => period !== undefined);
    this.periodsIds = {
      tutorial: null,
      lab: null,
    };
    this.periods = group.map((period: Period) => {
      let dayBase = dayNumber[period.day] * 12;
      if (period.type) {
        this.periodsIds[period.type] = period.id;
      }
      return [dayBase + (period.from - 1), dayBase + (period.to - 1)];
    });
    this.discardingCounter = 0;
    this.weight = 0;
  };

  incrementDiscardingCounter = (): void => {
    this.discardingCounter++;
  };

  decrementDiscardingCounter = (): void => {
    this.discardingCounter--;
  };

  discarded = (): boolean => {
    return this.discardingCounter != 0;
  }

  minDays = (currentSchedule: CurrentSchedule): number => {
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

    return addedDaysCount / 6;
  };

  maxDays = (currentSchedule: CurrentSchedule): number => {
    return 1 - this.minDays(currentSchedule);
  };

  earlyPeriods = (_currentSchedule: CurrentSchedule): number => {
    let earliness = 0;
    this.periods.forEach((period) => {
      const day = Math.floor(period[0] / 12),
        from = period[0] - 12 * day + 1;

      earliness += from;
    });

    return earliness / (12 * this.periods.length);
  };

  latePeriods = (currentSchedule: CurrentSchedule): number => {
    return 1 - this.earlyPeriods(currentSchedule);
  };

  gaps = (currentSchedule: CurrentSchedule): number => {
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
    return gaps / (11 * this.periods.length);
  };

  gapsPlus = (currentSchedule: CurrentSchedule): number => {
    return 1 - this.gaps(currentSchedule);
  };


  clashesWith = (currentSchedule: CurrentSchedule): boolean => {
    return this.periods.some((period) => {
      for (let i = period[0]; i < period[1] + 1; i++) {
        if (currentSchedule.schedule[i]) {
          return true;
        }
      }
      return false;
    });
  };

  updateWeight = (currentSchedule: CurrentSchedule, softConstraints: SoftConstraint[]): void => {
    for (let pref of softConstraints) {
      pref.priority = 10;
    }
    this.weight = softConstraints.reduce(
      (accumalator: number, softConstraint: SoftConstraint) => {
        return (
          accumalator +
          softConstraint.priority * this[softConstraint.type](currentSchedule)
        );
      },
      0
    );
  };
};
