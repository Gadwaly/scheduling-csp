import { chdir } from "process";
import { courses, getVariables } from "../data/timetable";
import { Variable, CourseGroup, CurrentSchedule } from "./models";
import { scheduleUpdated } from "./service";

const variables: Variable[] = getVariables();
let currentSchedule = new CurrentSchedule();

const pickVariableToAssign = () => {
  // Picks the variable with the least number of domain values
  let min = 1000000;
  let selectedVariable: Variable = variables[0];
  variables.forEach((variable) => {
    if (!variable.assignedValue && variable.domain.length < min) {
      selectedVariable = variable;
      min = variable.domain.length;
    }
  });
  return selectedVariable;
};

const forwardChecking = (currentVariable: Variable) => {
  let discardedValuesWithVariableIndex: any[] = [];
  let failed = false;
  const currentCourseGroups: CourseGroup[] = variables
    .filter((variable) => variable.assignedValue)
    .map((variable) => {
      return variable.assignedValue;
    });
  currentSchedule.update(currentCourseGroups);
  scheduleUpdated.next({
    currentVariable: JSON.parse(JSON.stringify(currentVariable)),
    variables: JSON.parse(JSON.stringify(variables)),
  });
  variables.forEach((variable, index) => {
    if (!variable.assignedValue) {
      const filteredDomain: number[] = variable.filterDomain(currentSchedule);
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const csp = () => {
  // console.log("---------------------------------------------------------------------------------\n---------------------------------------------------------------------------------")
  // console.log(currentSchedule, "\n-----")
  const all_assigned = variables.every((variable: Variable) => {
    return variable.assignedValue;
  });
  // console.log("ALL ASSIGNED:  ", all_assigned, "\n-----" )
  if (all_assigned) {
    return true;
  }
  const currentVariable: Variable = pickVariableToAssign();
  // console.log("PICKED VARIABLE:  ", currentVariable, "\n-----")
  currentVariable.domain
    .filter((value) => !value.discarded)
    .forEach((value) => {
      currentVariable.assignedValue = value;
      const fcOutput = forwardChecking(currentVariable);
      // console.log("FC OUTPUT:  ", fcOutput, "\n-----")
      // console.log("VARIABLES AFTER FC:  ", variables, "\n-----")
      if (!fcOutput.failed) {
        return csp();
      }
      // backtrack
      // reset current variable assignment
      currentVariable.assignedValue = null;
      // reset discarded values from fcOutput.discardedValues
      fcOutput.discardedValuesWithVariableIndex.forEach(
        (variableDiscardedValues) => {
          variableDiscardedValues[1].forEach((discardedValueIndex: any) => {
            variables[variableDiscardedValues[0]].domain[
              discardedValueIndex
            ].discarded = false;
          });
        }
      );
    });
};

csp();
// console.log(currentSchedule.scheduleGroups.map(cg => cg.periods))
// console.log(currentSchedule.schedule)

// cuurent

export { variables, Variable, CourseGroup };
