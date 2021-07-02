import { CurrentSchedule, Variable } from '../models';
import {SoftConstraint} from '../types';

export interface VariablePickerData {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  softConstraints: SoftConstraint[];
};

export const getVariablePicker = (pickingMethod: string, data: VariablePickerData): VariablePicker => {
  switch(pickingMethod) {
    case 'weights':
      return new WeightBasedVariablePicker(data);
    case 'min-values':
      return new MinValuesBasedVariablePicker(data);
    case 'average-domain-weights':
      return new AverageDomainWeightsVariablePicker(data);
  }
};

export abstract class VariablePicker {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  softConstraints: SoftConstraint[];

  constructor(data: VariablePickerData) {
    this.variables = data.variables;
    this.currentSchedule = data.currentSchedule;
    this.softConstraints = data.softConstraints;
  };

  abstract pick(): Variable;
};

export class WeightBasedVariablePicker extends VariablePicker {
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
        variable.updateDomainCosts(this.currentSchedule, this.softConstraints);
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
      if (!variable.hasAssignedValue() && variable.domain.length < min) {
        selectedVariable = variable;
        min = variable.domain.length;
      }
    });
    return selectedVariable;
  };
};

class AverageDomainWeightsVariablePicker extends VariablePicker {
  pick = (): Variable => {
    let min = Number.MAX_SAFE_INTEGER;
    let selectedVariable: Variable;
    for (let variable of this.variables) {
      if (!variable.hasAssignedValue()) {
        variable.updateDomainCosts(this.currentSchedule, this.softConstraints);
        let averageDomainCosts = variable.domain.reduce(
          (accumalator, courseGroup) => {
            return accumalator + courseGroup.cost
          },
        0 ) / variable.domain.length;
        if (averageDomainCosts < min) {
          min = averageDomainCosts;
          selectedVariable = variable;
        }
      }
    }
    return selectedVariable;
  }
};
