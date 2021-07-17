import { CurrentSchedule, Variable, CourseGroup } from "../models";
import { SoftConstraint } from "../types";
import { SoftConstraintsCostCalculatorData, SoftConstraintsBasedCostCalculator, CostLimitCalculator } from '.';

export interface SchedulerContextData {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  softConstraints: SoftConstraint[];
  groupOrderingMethods: string[];
  currentVariable?: Variable;
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
    group.cost = new SoftConstraintsBasedCostCalculator(this.softConstraintsCostCalculatorData)
    .calculate(this.schedulerContextData.currentSchedule, this.schedulerContextData.softConstraints);
    return this.applyGroupOrderingMethods(group);
  };

  private applyGroupOrderingMethods = (group: CourseGroup): number => {
    this.schedulerContextData.groupOrderingMethods.forEach((method) => {
      group.cost = this[method](group);
    });
    return group.cost;
  }

  private considerDiscardedAverageCostsWithTheirPercentage = (group: CourseGroup): number => {
    const DISCARDING_GROUPS_AVERAGE_COSTS_THRESHOLD = 0;

    const variables = this.schedulerContextData.variables;
    let availableGroups: CourseGroup[] = [];
    let discardedGroups: CourseGroup[] = [];
    variables.forEach((variable) => {
      if (variable !== this.schedulerContextData.currentVariable) {
        availableGroups.push(...variable.availableDomainGroups())
      }
    });
    availableGroups.forEach((courseGroup) => {
      if(group.clashesWithSpecificGroup(courseGroup)) {
        discardedGroups.push(courseGroup);
      }
    });
    let discardingPercent = 1;
    let averageCosts = 1;
    if(discardedGroups.length !== 0) {
      discardingPercent = discardedGroups.length / availableGroups.length;
      if(discardingPercent > DISCARDING_GROUPS_AVERAGE_COSTS_THRESHOLD) {
        averageCosts = discardedGroups.reduce((accumalator, courseGroup) => {
          const softConstraintsCostCalculatorData = {
            periods: courseGroup.periods,
            course: courseGroup.course,
            instructor: courseGroup.instructor
          };
          const cost = new SoftConstraintsBasedCostCalculator(softConstraintsCostCalculatorData)
          .calculate(this.schedulerContextData.currentSchedule, this.schedulerContextData.softConstraints);
          return accumalator + cost;
        }, 0) / discardedGroups.length;
      }
    }
    console.log('Previous Average = ', averageCosts);
    const newAverageCosts = this.getProjectedValue(averageCosts);
    console.log('New Average = ', newAverageCosts);
    const cost = group.cost + (newAverageCosts * discardingPercent);
    console.log('Previous Cost = ', group.cost);
    console.log('Final cost = ', cost);
    console.log(`Equation = group.cost (${group.cost}) + (newAverage (${newAverageCosts}) * [ DiscardedGroupsLength (${discardedGroups.length}) / AvailableGroupsLength (${availableGroups.length}) ])`);
    return cost;
  }

  private getProjectedValue = (oldAverageCosts: number, slope = 1): number => {
    const LIMIT = new CostLimitCalculator(this.schedulerContextData.softConstraints).calculate();
    return slope * ( LIMIT - oldAverageCosts );
  };
};
