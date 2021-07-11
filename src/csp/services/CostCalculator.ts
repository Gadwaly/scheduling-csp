import { CurrentSchedule, Variable, CourseGroup } from "../models";
import { SoftConstraint } from "../types";
import { SoftConstraintsCostCalculatorData, SoftConstraintsBasedCostCalculator } from '.';

export interface SchedulerContextData {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  softConstraints: SoftConstraint[];
  groupOrderingMethods: string[];
};

export interface CostCalculatorData {
  schedulerContextData: SchedulerContextData;
  softConstraintsCostCalculatorData: SoftConstraintsCostCalculatorData;
};

export class CostCalculator {
  private schedulerContextData: SchedulerContextData;
  private softConstraintsCostCalculatorData: SoftConstraintsCostCalculatorData;
  constructor(data: CostCalculatorData) {
    this.softConstraintsCostCalculatorData = data.softConstraintsCostCalculatorData;
    this.schedulerContextData = data.schedulerContextData;
  };

  calculate(group: CourseGroup) {
    let cost = new SoftConstraintsBasedCostCalculator(this.softConstraintsCostCalculatorData)
    .calculate(this.schedulerContextData.currentSchedule, this.schedulerContextData.softConstraints);
    return this.applyGroupOrderingMethods(cost, group);
  };

  private applyGroupOrderingMethods = (cost: number, group: CourseGroup): number => {
    this.schedulerContextData.groupOrderingMethods.forEach((method) => {
      cost = this[method](group);
    });
    return cost;
  }

  private considerDiscardedAverageCostsWithTheirPercentage = (group: CourseGroup): number => {
    const DISCARDING_GROUPS_AVERAGE_COSTS_THRESHOLD = 0;

    const variables = this.schedulerContextData.variables;
    let availableGroups: CourseGroup[];
    let discardedGroups: CourseGroup[];
    variables.forEach((variable) => availableGroups.push(...variable.availableDomainGroups()));
    availableGroups.forEach((courseGroup) => {
      if(courseGroup !== group && group.clashesWithSpecificGroup(courseGroup)) {
        discardedGroups.push(courseGroup);
      }
    });
    const discardingPercent = discardedGroups.length / availableGroups.length;
    let averageCosts = 1;
    if(discardingPercent >= DISCARDING_GROUPS_AVERAGE_COSTS_THRESHOLD) {
      averageCosts = discardedGroups.reduce((accumalator, courseGroup) => {
        return accumalator + courseGroup.cost
      }, 0) / discardedGroups.length;
    }
    return group.cost * averageCosts * discardingPercent;
  }
};
