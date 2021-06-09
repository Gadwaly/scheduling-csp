import { Variable, CourseGroup, CurrentSchedule } from './models';
import { scheduleUpdated, startCSP } from './services';

export class Scheduler {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  nextMethod: string;

  constructor(data: any) {
    this.variables = data.variables;
    this.currentSchedule = new CurrentSchedule();
    this.nextMethod = (data.nextMethod) ? data.nextMethod: 'min-values';
  }

  setNextMethod = (method: string) => {
    this.nextMethod = method;
  };

  pickVariableToAssign = () => {
    let min = 100000000;
    let selectedVariable: Variable = this.variables[0];
    if (this.nextMethod == "weights") {
      for (let variable of this.variables) {
        if (!variable.assignedValue) {
          let availableGroupsCount = variable.domain.filter(
            (group) => !group.discarded
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
    } else if (this.nextMethod == "min-values") {
      // Picks the variable with the least number of domain values
      this.variables.forEach((variable) => {
        if (!variable.assignedValue && variable.domain.length < min) {
          selectedVariable = variable;
          min = variable.domain.length;
        }
      });
    }
    return selectedVariable;
  };

  forwardChecking = (currentVariable: Variable) => {
    let discardedValuesWithVariableIndex: any[] = [];
    let failed = false;
    const currentCourseGroups: CourseGroup[] = this.variables
      .filter((variable) => variable.assignedValue)
      .map((variable) => {
        return variable.assignedValue;
      });
    this.currentSchedule.update(currentCourseGroups);
    scheduleUpdated.next({
      currentVariable: JSON.parse(JSON.stringify(currentVariable)),
      variables: JSON.parse(JSON.stringify(this.variables)),
    });
    this.variables.forEach((variable, index) => {
      if (!variable.assignedValue) {
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

  getFinalSchedule = () => {
    return this.variables.map((variable) => {
      return variable.getRegisteredGroup();
    });
  };

  csp = (): any => {
    // console.log("---------------------------------------------------------------------------------\n---------------------------------------------------------------------------------")
    // console.log(currentSchedule, "\n-----")
    const all_assigned = this.variables.every((variable: Variable) => {
      return variable.assignedValue;
    });
    // console.log("ALL ASSIGNED:  ", all_assigned, "\n-----" )
    if (all_assigned) {
      return true;
    }
    const currentVariable: Variable = this.pickVariableToAssign();
    // console.log("PICKED VARIABLE:  ", currentVariable, "\n-----")
    for (let value of currentVariable.domain) {
      if (!value.discarded) {
        currentVariable.assignedValue = value;
        const fcOutput = this.forwardChecking(currentVariable);
        // console.log(fcOutput.failed);
        // console.log("FC OUTPUT:  ", fcOutput, "\n-----")
        // console.log("VARIABLES AFTER FC:  ", variables, "\n-----")
        if (!fcOutput.failed) {
          return this.csp();
        }
        scheduleUpdated.next({
          currentVariable: JSON.parse(JSON.stringify(currentVariable)),
          variables: JSON.parse(JSON.stringify(this.variables)),
        });
        // backtrack
        // reset current variable assignment
        currentVariable.assignedValue = null;
        // reset discarded values from fcOutput.discardedValues
        fcOutput.discardedValuesWithVariableIndex.forEach(
          (variableDiscardedValues) => {
            variableDiscardedValues[1].forEach((discardedValueIndex: any) => {
              this.variables[variableDiscardedValues[0]].domain[
                discardedValueIndex
              ].discarded = false;
            });
          }
        );
      }
    }
  };

  schedule() {
    this.csp();
    return this.getFinalSchedule();
  }

  startCSP.subscribe(() => {
    this.csp();
  });
};

