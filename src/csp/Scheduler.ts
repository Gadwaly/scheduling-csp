import { ReplaySubject } from 'rxjs';
import { Variable, CurrentSchedule, CourseGroup } from './models';
import { SchedulerData, RegistredGroup, SoftConstraint, PreferencesData } from './types';
import { getVariablePicker, setSoftConstraints, VariablePicker, VariablePickerData } from './services'

export class Scheduler {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  scheduleUpdated: ReplaySubject<any>;
  softConstraints: SoftConstraint[];
  variablePicker: VariablePicker;

  constructor(data: SchedulerData) {
    this.variables = data.variables;
    this.softConstraints = data.softConstraints;
    this.currentSchedule = new CurrentSchedule();
    this.scheduleUpdated = new ReplaySubject();
    this.setVariablePickingMethod(data.nextMethod);
  };

  setVariablePickingMethod = (method = 'min-values'): void => {
    this.variablePicker = getVariablePicker(method, this.variablePickerData());
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

  pickVariable = (): Variable => {
    return this.variablePicker.pick();
  };

  csp = (): void => {
    const all_assigned = this.variables.every((variable) => variable.hasAssignedValue());
    if (all_assigned) return;
    const currentVariable = this.pickVariable();
    for (let value of currentVariable.domain) {
      if (!value.discarded()) {
        currentVariable.assignedValue = value;
        const fcOutput = this.forwardChecking(currentVariable);
        if (!fcOutput) return this.csp();
        this.updateVisualizer(currentVariable);
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
    let variablesNotChanged = 0;
    while(this.variables.length != variablesNotChanged) {
      variablesNotChanged = 0;
      for (let variable of this.variables) {
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

  private updateCurrentSchedule = (currentVariable: Variable): void => {
    this.currentSchedule.update(this.currentAssignedValues());
    this.updateVisualizer(currentVariable);
  };

  private currentAssignedValues = () => {
    return this.variables
    .filter((variable) => variable.hasAssignedValue())
    .map((variable) => variable.assignedValue);
  };

  private updateVisualizer = (currentVariable: Variable) => {
    this.scheduleUpdated.next({
      currentVariable: JSON.parse(JSON.stringify(currentVariable)),
      variables: JSON.parse(JSON.stringify(this.variables)),
    });
  };

  private variablePickerData = (): VariablePickerData => {
    return {
      variables: this.variables,
      currentSchedule: this.currentSchedule,
      softConstraints: this.softConstraints
    }
  };
};
