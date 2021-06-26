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

class WeightBasedVariablePicker extends VariablePicker {
  pick = (): Variable => {
    let min = Number.MAX_SAFE_INTEGER;
    let selectedVariable: Variable;
    for (let variable of this.variables) {
      if (!variable.assignedValue) {
        let availableGroupsCount = variable.domain
        .filter((courseGroup) => !courseGroup.discarded()).length;
        if (availableGroupsCount == 1) {
          selectedVariable = variable;
          break;
        }
        variable.updateWeights(this.currentSchedule, this.softConstraints);
        if (variable.domain[0].weight < min) {
          selectedVariable = variable;
          min = variable.domain[0].weight;
        }
      }
    }
    return selectedVariable;
  };
};

class MinValuesBasedVariablePicker extends VariablePicker {
  pick = (): Variable => {
    let min = Number.MAX_SAFE_INTEGER;
    let selectedVariable = this.variables[0];
    this.variables.forEach((variable) => {
      if (!variable.assignedValue && variable.domain.length < min) {
        selectedVariable = variable;
        min = variable.domain.length;
      }
    });
    return selectedVariable;
  };
};
