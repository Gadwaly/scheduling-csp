import { ReplaySubject } from 'rxjs';
import { Variable, CurrentSchedule, CourseGroup } from './models';
import { SchedulerData, RegistredGroup, SoftConstraint, PreferencesData } from './types';
import { setSoftConstraints } from './services'

export class Scheduler {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  nextMethod: string;
  scheduleUpdated: ReplaySubject<any>;
  softConstraints: SoftConstraint[];
  assignedVariables: Variable[];

  constructor(data: SchedulerData) {
    this.variables = data.variables;
    this.softConstraints = data.softConstraints;
    this.currentSchedule = new CurrentSchedule();
    this.nextMethod = (data.nextMethod) ? data.nextMethod: 'min-values';
    this.scheduleUpdated = new ReplaySubject();
    this.assignedVariables = [];
  };

  setNextMethod = (method: string): void => {
    this.nextMethod = method;
  };

  setSoftConstraints = (preferences: PreferencesData) => {
    this.softConstraints = setSoftConstraints(preferences)
  }

  schedule = (): RegistredGroup[] | void => {
    this.csp();
    this.improveAssignedValues();
    return this.getFinalSchedule();
  };

  getFinalSchedule = (): RegistredGroup[] => {
    return this.variables.map((variable) => {
      return variable.getRegisteredGroup();
    });
  };

  csp = (): void => {
    const all_assigned = this.variables.every((variable) => variable.hasAssignedValue());
    if (all_assigned) return;
    const currentVariable = this.pickVariable();
    for (let value of currentVariable.domain) {
      if (!value.discarded()) {
        currentVariable.assignedValue = value;
        const fcOutput = this.forwardChecking(currentVariable);
        console.log("CourseCode = " + currentVariable.courseCode, fcOutput);
        if (!fcOutput) return this.csp();
        this.updateVisualizer(currentVariable);
        // backtrack
        // reset current variable assignment
        currentVariable.resetAssignedValue();
      }
    }
  };

  forwardChecking = (currentVariable: Variable): boolean  => {
    let failed = false;
    this.updateCurrentSchedule(currentVariable);
    this.variables.forEach((variable) => {
      if (variable != currentVariable) {
        const filteredDomain = variable.filterDomain(this.currentSchedule);
      currentVariable.addAssignedValuesClashesWith(filteredDomain);
        if (!variable.hasAssignedValue()) {
          variable.updateWeights(this.currentSchedule, this.softConstraints);
          if (variable.hasEmptyDomain()) {
            failed = true;
          }
        }
      }
    });
    return failed;
  };

  improveAssignedValues = () => {
    console.log('HERE');
    let variablesNotChanged = 0;
    while(this.variables.length != variablesNotChanged) {
      variablesNotChanged = 0;
      for (let variable of this.variables) {
        console.log('Loop On Variables');
        variable.updateWeights(this.currentSchedule, this.softConstraints);
        for(let value of variable.domain) {
          if(!value.discarded()) {
            if (value.weight < variable.assignedValue.weight) {
              variable.resetAssignedValue();
              variable.assignedValue = value;
              this.updateCurrentSchedule(variable);
              let assignedValueClashes: CourseGroup[] = []
              this.variables.forEach((v) => {
                const filteredDomain = v.filterDomain(this.currentSchedule);
                assignedValueClashes.push(...filteredDomain);
              });
              variable.setAssigendValuesClashesWith(assignedValueClashes);
              this.updateVisualizer(variable);
            } else {
              variablesNotChanged++;
              break;
            }
          }
        }
      }
    }
  };

  pickVariable = (): Variable => {
    switch(this.nextMethod) {
      case 'weights':
        return this.pickWithWeights();
      case 'min-values':
        return this.pickWithMinValues();
    }
  };

  pickWithWeights = (): Variable => {
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

  pickWithMinValues = (): Variable => {
    let min = Number.MAX_SAFE_INTEGER;
    let selectedVariable = this.variables[0];
    // Picks the variable with the least number of domain values
    this.variables.forEach((variable) => {
      if (!variable.assignedValue && variable.domain.length < min) {
        selectedVariable = variable;
        min = variable.domain.length;
      }
    });
    return selectedVariable;
  };


  private currentAssignedValues = () => {
    return this.variables
    .filter((variable) => variable.hasAssignedValue())
    .map((variable) => variable.assignedValue);
  };

  private updateCurrentSchedule = (currentVariable: Variable): void => {
    this.currentSchedule.update(this.currentAssignedValues());
    this.updateVisualizer(currentVariable);
  }

  private updateVisualizer = (currentVariable: Variable) => {
    this.scheduleUpdated.next({
      currentVariable: JSON.parse(JSON.stringify(currentVariable)),
      variables: JSON.parse(JSON.stringify(this.variables)),
    });
  }
};

interface ForwardCheckingResult {
  failed: boolean;
  discardedValuesWithVariableIndex: DiscardedValuesWithVariableIndex[];
};

type DiscardedValuesWithVariableIndex = [number, number[]];
