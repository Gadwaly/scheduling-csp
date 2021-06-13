import { Variable, CurrentSchedule } from './models';
import { scheduleUpdated, startCSP } from './services';
import { SchedulerData, RegistredGroup } from './types';

export class Scheduler {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  nextMethod: string;

  constructor(data: SchedulerData) {
    this.variables = data.variables;
    this.currentSchedule = new CurrentSchedule();
    this.nextMethod = (data.nextMethod) ? data.nextMethod: 'min-values';
  };

  setNextMethod = (method: string): void => {
    this.nextMethod = method;
  };

  pickVariableToAssign = (): Variable => {
    let min = 100000000;
    let selectedVariable = this.variables[0];
    if (this.nextMethod == 'weights') {
      for (let variable of this.variables) {
        if (variable.hasAssignedValue) {
          let availableGroupsCount = variable.domain.filter(
            (courseGroup) => !courseGroup.discarded
          ).length;
          if (availableGroupsCount == 1) {
            selectedVariable = variable;
            break;
          }
          variable.updateWeights(this.currentSchedule);
          if (variable.domain[0].weight < min) {
            selectedVariable = variable;
            min = variable.domain[0].weight;
          }
        }
      }
    } else if (this.nextMethod == 'min-values') {
      // Picks the variable with the least number of domain values
      this.variables.forEach((variable) => {
        if (variable.hasAssignedValue && variable.domain.length < min) {
          selectedVariable = variable;
          min = variable.domain.length;
        }
      });
    }
    return selectedVariable;
  };

  forwardChecking = (currentVariable: Variable): ForwardCheckingResult  => {
    let discardedValuesWithVariableIndex: DiscardedValuesWithVariableIndex[] = [];
    let failed = false;
    const currentCourseGroups = this.variables
      .filter((variable) => variable.hasAssignedValue)
      .map((variable) => {
        return variable.assignedValue;
      });
    this.currentSchedule.update(currentCourseGroups);
    scheduleUpdated.next({
      currentVariable: JSON.parse(JSON.stringify(currentVariable)),
      variables: JSON.parse(JSON.stringify(this.variables)),
    });
    this.variables.forEach((variable, index) => {
      if (variable.hasAssignedValue) {
        const filteredDomain: number[] = variable.filterDomain(this.currentSchedule);
        variable.updateWeights(this.currentSchedule);
        if (variable.domain.every((courseGroup) => courseGroup.discarded)) {
          failed = true;
        }
        discardedValuesWithVariableIndex.push([index, filteredDomain]);
      }
    });
    return {
      failed,
      discardedValuesWithVariableIndex,
    };
  };

  getFinalSchedule = (): RegistredGroup[] => {
    return this.variables.map((variable) => {
      return variable.getRegisteredGroup();
    });
  };

  csp = (): boolean | void => {
    // console.log('---------------------------------------------------------------------------------\n---------------------------------------------------------------------------------')
    // console.log(currentSchedule, '\n-----')
    const all_assigned = this.variables.every((variable) => {
      return variable.assignedValue;
    });
    // console.log('ALL ASSIGNED:  ', all_assigned, '\n-----' )
    if (all_assigned) {
      return true;
    }
    const currentVariable = this.pickVariableToAssign();
    // console.log('PICKED VARIABLE:  ', currentVariable, '\n-----')
    for (let value of currentVariable.domain) {
      if (!value.discarded) {
        currentVariable.assignedValue = value;
        currentVariable.hasAssignedValue = true;
        const fcOutput = this.forwardChecking(currentVariable);
        // console.log(fcOutput.failed);
        // console.log('FC OUTPUT:  ', fcOutput, '\n-----')
        // console.log('VARIABLES AFTER FC:  ', variables, '\n-----')
        if (!fcOutput.failed) {
          return this.csp();
        }
        scheduleUpdated.next({
          currentVariable: JSON.parse(JSON.stringify(currentVariable)),
          variables: JSON.parse(JSON.stringify(this.variables)),
        });
        // backtrack
        // reset current variable assignment
        currentVariable.hasAssignedValue = false;
        // reset discarded values from fcOutput.discardedValues
        fcOutput.discardedValuesWithVariableIndex.forEach(
          (variableDiscardedValues) => {
            variableDiscardedValues[1].forEach((discardedValueIndex: number) => {
              this.variables[variableDiscardedValues[0]].domain[
                discardedValueIndex
              ].discarded = false;
            });
          }
        );
      }
    }
  };

  schedule = (): RegistredGroup[] => {
    this.csp();
    return this.getFinalSchedule();
  };

};

// startCSP.subscribe(() => {
//   this.csp();
// });

interface ForwardCheckingResult {
  failed: boolean;
  discardedValuesWithVariableIndex: DiscardedValuesWithVariableIndex[];
};

type DiscardedValuesWithVariableIndex = [number, number[]];
