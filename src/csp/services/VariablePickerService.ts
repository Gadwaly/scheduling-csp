import { CurrentSchedule, Variable } from '../models';
import {SoftConstraint} from '../types';
import { SchedulerContextData } from '.';

export const getVariablePicker = (pickingMethod: string, data: { schedulerContextData: SchedulerContextData }): VariablePicker => {
  switch(pickingMethod) {
    case 'first-unAssigned':
      return new FirstUnAssigned(data);
    case 'costs':
      return new CostBasedVariablePicker(data);
    case 'min-values':
      return new MinValuesBasedVariablePicker(data);
    case 'average-domain-costs':
      return new AverageDomainCostsVariablePicker(data);
  }
};

export abstract class VariablePicker {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  softConstraints: SoftConstraint[];
  data: { schedulerContextData: SchedulerContextData };

  constructor(data: { schedulerContextData: SchedulerContextData }) {
    this.data = data;
    this.variables = data.schedulerContextData.variables;
    this.currentSchedule = data.schedulerContextData.currentSchedule;
    this.softConstraints = data.schedulerContextData.softConstraints;
  };

  abstract pick(): Variable;
};

export class CostBasedVariablePicker extends VariablePicker {
  pick = (): Variable => {
    let min = Number.MAX_SAFE_INTEGER;
    let selectedVariable: Variable;
    for (let variable of this.variables) {
      if (!variable.hasAssignedValue()) {
        let availableGroupsCount = variable.availableDomainGroups().length;
        if (availableGroupsCount === 1) {
          selectedVariable = variable;
          break;
        }
        variable.updateDomainCosts(this.data);
        if (variable.domain[0].cost < min) {
          selectedVariable = variable;
          min = variable.domain[0].cost;
        }
      }
    }
    return selectedVariable;
  };
};

class MinValuesBasedVariablePicker extends VariablePicker {
  pick = (): Variable => {
    let min = Number.MAX_SAFE_INTEGER;
    let selectedVariable: Variable;
    this.variables.forEach((variable) => {
      if (!variable.hasAssignedValue() && variable.availableDomainGroups().length < min) {
        selectedVariable = variable;
        min = variable.domain.length;
      }
    });
    selectedVariable.updateDomainCosts(this.data);
    return selectedVariable;
  };
};

class AverageDomainCostsVariablePicker extends VariablePicker {
  pick = (): Variable => {
    let variablesMap: { values: number; variable: Variable; }[] = [];
    let max = Number.MIN_SAFE_INTEGER;
    let inferences = false;
    let selectedVariable: Variable;
    for (let variable of this.variables) {
      if (!variable.hasAssignedValue()) {
        let availableGroupsCount = variable.availableDomainGroups().length;
        if (availableGroupsCount === 1) {
          selectedVariable = variable;
          inferences = true;
          break;
        }
        variable.updateDomainCosts(this.data);
        let averageDomainCosts = variable.availableDomainGroups().reduce(
          (accumalator, courseGroup) => {
            return accumalator + courseGroup.cost
          },
        0 ) / availableGroupsCount;
        // let values = 0;
        // variable.availableDomainGroups().forEach((group) => {
          // if (group.cost <= averageDomainCosts) {
          //   values++;
          // }
        // });
        // variablesMap.push({ values, variable });
        if (averageDomainCosts > max) {
          max = averageDomainCosts;
          selectedVariable = variable;
        }
      }
    }
    // if (!inferences) {
    //   variablesMap.sort((a, b) => a.values - b.values);
    //   selectedVariable = variablesMap[0].variable;
    // }
    return selectedVariable;
  }
};

class FirstUnAssigned extends VariablePicker {
  pick = (): Variable => {
    let selectedVariable: Variable;
    this.variables.forEach((variable) => {
      if(!variable.hasAssignedValue())
        selectedVariable = variable;
        break;
    });
    return selectedVariable;
  };
};
