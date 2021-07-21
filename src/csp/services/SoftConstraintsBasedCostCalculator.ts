import { CurrentSchedule } from "../models";
import { SoftConstraint, dayNumber } from "../types";
import configs from "../configs.json";
import { ScheduleScoreCalculator } from "./ScheduleScoreCalculator";

export interface SoftConstraintsCostCalculatorData {
  periods: number[][];
  course: string;
  instructor: string;
}

export const weightsMap = {
  0: configs.weights.high,
  1: configs.weights.mid,
  2: configs.weights.low,
  null: 1,
};

export class SoftConstraintsBasedCostCalculator {
  private periods: number[][];
  private course: string;
  private instructor: string;

  constructor(data: SoftConstraintsCostCalculatorData) {
    this.periods = data.periods;
    this.course = data.course;
    this.instructor = data.instructor;
  }

  calculate = (
    currentSchedule: CurrentSchedule,
    softConstraints: SoftConstraint[]
  ): number => {
    let scoreCaclculator: ScheduleScoreCalculator = new ScheduleScoreCalculator(
      currentSchedule,
      softConstraints
    );
    let scoreAfter = scoreCaclculator.calculate();
    return -scoreAfter;
    // return softConstraints.reduce((accumalator, softConstraint) => {
    //   return (
    //     accumalator +
    //     weightsMap[softConstraint.priority] *
    //       this[softConstraint.type](currentSchedule, softConstraint.param)
    //   );
    // }, 0);
  };

  private minDays = (
    currentSchedule: CurrentSchedule,
    internalWieght = +configs.weights.minOrMaxDays
  ) => {
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

  private maxDays = (
    currentSchedule: CurrentSchedule,
    internalWieght = +configs.weights.minOrMaxDays
  ) => {
    return -this.minDays(currentSchedule, 1) * internalWieght;
  };

  private earlyPeriods = (
    _currentSchedule: CurrentSchedule,
    internalWieght = +configs.weights.earlyOrLate
  ) => {
    let earliness = 0;
    this.periods.forEach((period) => {
      const day = Math.floor(period[0] / 12),
        from = period[0] - 12 * day + 1;

      earliness += from;
    });

    return earliness * internalWieght;
  };

  private latePeriods = (
    currentSchedule: CurrentSchedule,
    internalWieght = +configs.weights.earlyOrLate
  ) => {
    return -this.earlyPeriods(currentSchedule, 1) * internalWieght;
  };

  private gaps = (
    currentSchedule: CurrentSchedule,
    internalWieght = +configs.weights.gaps
  ) => {
    let gaps = 0,
      gaps_before = 0;
    let current = currentSchedule.schedule;
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
        if (current[i]) {
          if (firstPeriod > i) firstPeriod = i;
          if (lastPeriod < i) lastPeriod = i;
        }
      }

      for (let i = firstPeriod; i < lastPeriod; i++)
        if (!current[i]) gaps_before++;
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

    return (gaps - gaps_before) * internalWieght;
  };

  private gapsPlus = (
    currentSchedule: CurrentSchedule,
    internalWieght = +configs.weights.gaps
  ) => {
    return -this.gaps(currentSchedule, 1) * internalWieght;
  };

  private daysOff = (
    currentSchedule: CurrentSchedule,
    days: string[],
    internalWieght = +configs.weights.offDays
  ) => {
    const busyDays = new Array(6).fill(false);
    for (let i = 0; i < 6; i++) {
      for (let j = i * 12; j < i * 12 + 12; j++) {
        if (currentSchedule.schedule[j]) {
          busyDays[i] = true;
          break;
        }
      }
    }

    let hits = 0,
      hit = false;
    for (let i = 0; i < days.length; i++) {
      for (let j = 0; j < this.periods.length; j++) {
        const period = this.periods[j];
        let dayIndex = Math.floor(period[0] / 12);
        if (dayIndex === dayNumber[days[i]] && !busyDays[i]) {
          hits++;
          hit = true;
          break;
        }
      }
      if (!hit) hits--;
      hit = false;
    }

    return hits * internalWieght;
  };

  private courseInstructor = (
    _currentSchedule: CurrentSchedule,
    instructors: any,
    internalWieght = +configs.weights.instructor
  ) => {
    if (this.instructor && instructors[this.course]) {
      if (this.instructor === instructors[this.course].instructor)
        return -1 * internalWieght;
      return 1 * internalWieght;
    }
    return 0;
  };
}
