import { CurrentSchedule } from ".";
import { Period, dayNumber } from "../types";
import { CostCalculator, SchedulerContextData, SoftConstraintsCostCalculatorData } from '../services';

interface PeriodsIds {
  tutorial?: string | null;
  lab?: string | null;
};

export class CourseGroup {
  uniqueID: string;
  periods: number[][];
  cost: number;
  periodsIds: PeriodsIds;
  groupNum: string;
  discardingCounter: number;
  instructor!: string;
  course!: string;
  clashingCourseGroups: CourseGroup[];
  reservedTimeSlots: object;

  constructor(groupNum: string, group: Period[], instructor: string, course: string) {
    this.groupNum = groupNum;
    this.course = course;
    this.instructor = instructor;
    this.periodsIds = { tutorial: null, lab: null };
    this.setPeriods(group.filter((period: Period) => period !== undefined));
    this.setReservedTimeSlots();
    this.cost = 0;
    this.discardingCounter = 0;
    this.clashingCourseGroups = [];
    this.uniqueID = `${this.course}-${groupNum}${this.periodsIds.tutorial ? "-" + this.periodsIds.tutorial : ""}${this.periodsIds.lab ? "-" + this.periodsIds.lab : ""}`
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

  private setReservedTimeSlots = (): void => {
    this.periods.forEach((period) => {
      for(let i = period[0]; i < period[1] + 1; i++){
        this.reservedTimeSlots[i] = true;
      }
    });
  }

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

  clashesWithSpecificGroup = (group: CourseGroup): boolean => {
    group.periods.forEach((period) => {
      for(let i = period[0]; i < period[1] + 1; i++){
        if(this.reservedTimeSlots[i])
          return true;
      }
    })
    return false;
  };

  updateCost = (data: { schedulerContextData: SchedulerContextData }): void => {
    this.cost = new CostCalculator({ ...this.softConstraintsCostCalculatorData(), ...data }).calculate(this);
  };

  clone = (): CourseGroup => {
    let clonedGroup = Object.assign(new CourseGroup(null, [], null, null), JSON.parse(JSON.stringify(this)))
    clonedGroup.clashingCourseGroups = this.clashingCourseGroups.map((clashingGroup) => clashingGroup.uniqueID)
    return clonedGroup
  }

  softConstraintsCostCalculatorData = (): {
    softConstraintsCostCalculatorData: SoftConstraintsCostCalculatorData;
  } => {
    return {
      softConstraintsCostCalculatorData: {
        periods: this.periods,
        course: this.course,
        instructor: this.instructor
      }
    }
  };
};
