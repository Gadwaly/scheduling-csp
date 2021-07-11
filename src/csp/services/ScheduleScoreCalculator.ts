import { CurrentSchedule } from "../models";
import { SoftConstraint, dayNumber } from "../types";

export class ScheduleCostCalculator {
  private currentSchedule: CurrentSchedule;
  private softConstraints: SoftConstraint[];
  private busyDays: number[];
  private daysCount: number;
  logs: string[];

  constructor(
    currentSchedule: CurrentSchedule,
    softConstraints: SoftConstraint[]
  ) {
    this.currentSchedule = currentSchedule;
    this.softConstraints = softConstraints;
    this.busyDays = undefined;
    this.daysCount = undefined;
    this.logs = [];
  }

  calculate = (): number => {
    return this.softConstraints.reduce((accumalator, softConstraint) => {
      return (
        accumalator +
        softConstraint.priority *
          this[softConstraint.type](
            softConstraint.priority,
            softConstraint.param
          )
      );
    }, 0);
  };

  printLogs = (): void => {
    console.log(this.logs);
    this.logs.forEach((log) => console.log(log));
  };

  getBusyDays = (): number[] => {
    if (this.busyDays) return this.busyDays;
    const busyDays = new Array(6).fill(false);
    let daysCount = 0;
    for (let i = 0; i < 6; i++) {
      for (let j = i * 12; j < i * 12 + 12; j++) {
        if (this.currentSchedule.schedule[j]) {
          busyDays[i] = true;
          daysCount++;
          break;
        }
      }
    }
    this.busyDays = busyDays;
    this.daysCount = daysCount;
    return busyDays;
  };

  getDaysCount = (): number => {
    if (this.daysCount) return this.daysCount;
    this.getBusyDays();
    return this.daysCount;
  };

  getEarlinessScore = (): number => {
    let earliness = 0;
    this.currentSchedule.scheduleGroups.forEach((scheduleGroup) => {
      scheduleGroup.periods.forEach((period) => {
        const day = Math.floor(period[0] / 12),
          from = period[0] - 12 * day + 1;
        earliness += from;
      });
    });
    return earliness;
  };

  private minDays = (priority, internalWieght = 1, log = true) => {
    let daysCount = this.getDaysCount();
    if (log)
      this.logs.push(
        `Min Days: ${daysCount} days in the schedule [-${daysCount} * ${internalWieght} * ${priority}]`
      );
    return -daysCount * internalWieght;
  };

  private maxDays = (priority, internalWieght = 1, log = true) => {
    let daysCount = this.getDaysCount();
    if (log)
      this.logs.push(
        `Max Days: ${daysCount} days in the schedule [+${daysCount} * ${internalWieght} * ${priority}]`
      );
    return daysCount * internalWieght;
  };

  private earlyPeriods = (priority, internalWieght = 1 / 5, log = true) => {
    const earliness = this.getEarlinessScore();
    if (log)
      this.logs.push(
        `Early Periods: eraliness score = ${earliness} (sigma of the starting periods)  [-${earliness} * ${internalWieght} * ${priority}]`
      );
    return -earliness * internalWieght;
  };

  private latePeriods = (priority, internalWieght = 1 / 5, log = true) => {
    const earliness = this.getEarlinessScore();
    if (log)
      this.logs.push(
        `late Periods: eraliness score = ${earliness} (sigma of the starting periods)  [+${earliness} * ${internalWieght} * ${priority}]`
      );
    return earliness * internalWieght;
  };

  private gaps = (priority, internalWieght = 1 / 3, log = true) => {
    let gaps = 0;
    let busyDays: number[] = this.getBusyDays();

    busyDays.forEach((day) => {
      let firstPeriod = day * 12 + 11,
        lastPeriod = day * 12;

      for (let i = day * 12; i < day * 12 + 12; i++) {
        if (this.currentSchedule.schedule[i]) {
          if (firstPeriod > i) firstPeriod = i;
          if (lastPeriod < i) lastPeriod = i;
        }
      }

      for (let i = firstPeriod; i < lastPeriod; i++)
        if (!this.currentSchedule.schedule[i]) gaps++;
    });

    if (log)
      this.logs.push(
        `Gaps: there are ${gaps} gaps in the schedule  [-${gaps} * ${internalWieght} * ${priority}]`
      );

    return -gaps * internalWieght;
  };

  private gapsPlus = (priority, internalWieght = 1 / 3, log = true) => {
    const gaps = this.gaps(1, priority, false);
    if (log)
      this.logs.push(
        `Gaps plus: there are ${gaps} gaps in the schedule  [+${gaps} * ${internalWieght} * ${priority}]`
      );
    return gaps * internalWieght;
  };

  private daysOff = (
    days: string[],
    priority,
    internalWieght = 3,
    log = true
  ) => {
    const busyDays = this.getBusyDays();
    let hits = 0;
    for (let i = 0; i < days.length; i++) {
      if (busyDays[dayNumber[days[i]]]) {
        hits--;
        if (log)
          this.logs.push(
            `days off: ${days[i]} is not off  [-1 * ${internalWieght} * ${priority}]`
          );
      } else {
        hits++;
        if (log)
          this.logs.push(
            `days off: ${days[i]} is off  [+1 * ${internalWieght} * ${priority}]`
          );
      }
    }

    return hits * internalWieght;
  };

  private courseInstructor = (
    instructors: any,
    priority,
    internalWieght = 2,
    log = true
  ) => {
    let hits = 0;
    this.currentSchedule.scheduleGroups.forEach((scheduleGroup) => {
      if (scheduleGroup.instructor && instructors[scheduleGroup.course]) {
        if (
          scheduleGroup.instructor ===
          instructors[scheduleGroup.course].instructor
        ) {
          hits++;
          if (log)
            this.logs.push(
              `Instructor: ${scheduleGroup.course} is registered with ${
                instructors[scheduleGroup.course].instructor
              } [+1 * ${internalWieght} * ${priority}]`
            );
        } else {
          hits--;
          if (log)
            this.logs.push(
              `Instructor: ${scheduleGroup.course} is not registered with ${
                instructors[scheduleGroup.course].instructor
              } [-1 * ${internalWieght} * ${priority}]`
            );
        }
      }
    });
    return hits * internalWieght;
  };
}
