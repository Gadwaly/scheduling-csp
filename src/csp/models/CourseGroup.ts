import { CurrentSchedule } from ".";
import { Period, SoftConstraint, dayNumber } from "../types";
import { CostCalculator } from '../services';

interface PeriodsIds {
  tutorial?: string | null;
  lab?: string | null;
};

export class CourseGroup {
  periods: number[][];
  cost: number;
  periodsIds: PeriodsIds;
  groupNum: string;
  discardingCounter: number;
  instructor!: string;
  course!: string;
  clashingCourseGroups: CourseGroup[];
  private costCalculator: CostCalculator;

  constructor(groupNum: string, group: Period[], instructor: string, course: string) {
    this.groupNum = groupNum;
    this.course = course;
    this.instructor = instructor;
    this.periodsIds = { tutorial: null, lab: null };
    this.setPeriods(group.filter((period: Period) => period !== undefined));
    this.costCalculator = new CostCalculator(this.periods, this.course, this.instructor);
    this.cost = 0;
    this.discardingCounter = 0;
    this.clashingCourseGroups = [];
  }

  private setPeriods = (group: Period[]): void => {
    this.periods = group.map((period: Period) => {
      let dayBase = dayNumber[period.day] * 12;
      if (period.type) {
        this.periodsIds[period.type] = period.id;
      }
      return [dayBase + (period.from - 1), dayBase + (period.to - 1)];
    })
  };

  addToClashingCourseGroups = (groups: CourseGroup[]): void => {
    groups.forEach((group) => group.incrementDiscardingCounter());
    this.clashingCourseGroups.push(...groups);
  };

  resetClashingCourseGroups = (): void => {
    this.clashingCourseGroups.forEach((group) => group.decrementDiscardingCounter());
    this.clashingCourseGroups = [];
  }

  incrementDiscardingCounter = (): void => {
    this.discardingCounter++;
  };

  decrementDiscardingCounter = (): void => {
    this.discardingCounter--;
  };

  discarded = (): boolean => this.discardingCounter !== 0;

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

  updateCost = (currentSchedule: CurrentSchedule, softConstraints: SoftConstraint[]): void => {
    this.cost = this.costCalculator.calculate(currentSchedule, softConstraints);
  };
}