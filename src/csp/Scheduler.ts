import { ReplaySubject } from 'rxjs';
import { Variable, CurrentSchedule } from './models';
import { SchedulerData, RegistredGroup, SoftConstraint } from './types';
import { getVariablePicker, VariablePicker, VariablePickerData } from './services'
import { SchedulerSnapshot } from './types/SchedulerSnapshot';

export class Scheduler {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  scheduleUpdated: ReplaySubject<any>;
  softConstraints: SoftConstraint[];
  variablePicker: VariablePicker;
  schedulerSnapshots: SchedulerSnapshot[];

  constructor(data: SchedulerData) {
    this.variables = data.variables;
    this.softConstraints = data.softConstraints;
    this.currentSchedule = new CurrentSchedule();
    this.scheduleUpdated = new ReplaySubject();
    this.setVariablePickingMethod(data.variablePickingMethod);
    this.createSnapshot();
  };

  setVariablePickingMethod = (method = 'min-values'): void => {
    this.variablePicker = getVariablePicker(method, this.variablePickerData());
  };

  createSnapshot = () => {
    this.schedulerSnapshots = [{
      variables: this.variables.map(variable => variable.clone()),
      currentSchedule: new CurrentSchedule()
    }]
  }

  restoreSnapshot = (snapshotIndex: number) => {
    this.variables = this.schedulerSnapshots[snapshotIndex].variables;
    this.currentSchedule = this.schedulerSnapshots[snapshotIndex].currentSchedule;
  }
  schedule = (): RegistredGroup[] => {
    this.csp();
    this.improveAssignedValues();
    return this.getFinalSchedule();
  };

  private getFinalSchedule = (): RegistredGroup[] => {
    return this.variables.map((variable) => {
      return variable.getRegisteredGroup();
    });
  };

  private csp = (): void => {
    if (this.allVariablesHasAssignedValue()) return;
    const currentVariable = this.pickVariable();
    for (let group of currentVariable.availableDomainGroups()) {
      currentVariable.assignedValue = group;
      if (this.forwardChecking(currentVariable)) return this.csp();
      this.updateVisualizer(currentVariable);
      currentVariable.resetAssignedValue();
    }
  };

  private forwardChecking = (currentVariable: Variable): boolean  => {
    let success = true;
    this.updateCurrentSchedule(currentVariable);
    for (let variable of this.variables) {
      if (variable !== currentVariable) {
        const clashingCourseGroups = variable.getClashingCourseGroups(this.currentSchedule);
        currentVariable.assignedValue.addToClashingCourseGroups(clashingCourseGroups);
        if (!variable.hasAssignedValue() && variable.hasEmptyDomain()) {
          success = false
        }
      }
    }
    return success;
  };

  private improveAssignedValues = () => {
    let notChangedVariables = 0;
    while(this.variables.length !== notChangedVariables) {
      notChangedVariables = 0;
      for (let variable of this.variables) {
        variable.updateDomainCosts(this.currentSchedule, this.softConstraints);
        for(let group of variable.availableDomainGroups()) {
          if (group.cost < variable.assignedValue.cost) {
            variable.resetAssignedValue();
            variable.assignedValue = group;
            this.updateCurrentSchedule(variable);
            this.variables.forEach((variableItem) => {
              variable.assignedValue
              .addToClashingCourseGroups(variableItem.getClashingCourseGroups(this.currentSchedule));
            });
            this.updateVisualizer(variable);
          } else {
            notChangedVariables++;
            break;
          }
        }
      }
    }
  };

  private pickVariable = (): Variable => {
    return this.variablePicker.pick();
  };

  private allVariablesHasAssignedValue = (): boolean => {
    return this.variables.every((variable) => variable.hasAssignedValue());
  };

  private updateCurrentSchedule = (currentVariable: Variable): void => {
    this.currentSchedule.update(this.currentAssignedValues());
    this.updateVisualizer(currentVariable);
  };

  private currentAssignedValues = () => {
    return this.variables.filter((variable) => variable.hasAssignedValue())
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
