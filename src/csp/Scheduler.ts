import { ReplaySubject } from 'rxjs';
import { Variable, CurrentSchedule, CourseGroup } from './models';
import { SchedulerData, RegistredGroup, SoftConstraint } from './types';
import { SchedulerSnapshot } from './types/SchedulerSnapshot';
import { getVariablePicker, SchedulerContextData } from './services'

export class Scheduler {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  scheduleUpdated: ReplaySubject<any>;
  softConstraints: SoftConstraint[];
  schedulerSnapshots: SchedulerSnapshot[];
  variablePickingMethod: string;
  groupOrderingMethods: string[];

  constructor(data: SchedulerData) {
    this.variables = data?.variables;
    this.softConstraints = data?.softConstraints;
    this.currentSchedule = new CurrentSchedule();
    this.scheduleUpdated = new ReplaySubject();
    this.setVariablePickingMethod(data?.variablePickingMethod);
    this.setGroupOrderingMethods(data.groupOrderingMethods);
  };

  setVariablePickingMethod = (method = 'min-values'): void => {
    this.variablePickingMethod = method;
  };

  setGroupOrderingMethods = (methods = ['considerDiscardedAverageCostsWithTheirPercentage']): void => {
    this.groupOrderingMethods = methods;
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
    let firstCSP = true;
    do {
      if(!firstCSP){
        // Remove the variable with the highest backtrackingCauseCount
        const maxBacktrackingCauseCount = Math.max(...this.variables.map(variable => variable.backtrackingCauseCount));
        const variableToBeRemovedCode = this.variables.find(variable => variable.backtrackingCauseCount === maxBacktrackingCauseCount).courseCode;
        this.variables = this.variables.filter(variable => variable.courseCode !== variableToBeRemovedCode)
        this.variables.forEach((variable) => {
          variable.resetState()
        })
        this.currentSchedule = new CurrentSchedule()
      }
      this.csp();
      firstCSP = false
    }while(!this.allVariablesHasAssignedValue())
    this.improveAssignedValues();
    return this.getFinalSchedule();
  };

  private getFinalSchedule = (): RegistredGroup[] => {
    return this.variables.map((variable) => {
      return variable.getRegisteredGroup();
    });
  };

  protected csp = (): void => {
    if (this.allVariablesHasAssignedValue()) return;
    const currentVariable = this.pickVariable();
    for (let group of currentVariable.availableDomainGroups()) {
      currentVariable.assignedValue = group;
      this.updateCurrentSchedule(currentVariable);
      if (this.forwardCheck(currentVariable)) return this.csp();
      this.updateVisualizer(currentVariable);
      currentVariable.resetAssignedValue();
    }
  };

  private forwardCheck = (currentVariable: Variable): boolean  => {
    for (let variable of this.variables) {
      if (variable !== currentVariable) {
        const clashingCourseGroups = variable.getClashingCourseGroups(this.currentSchedule);
        currentVariable.assignedValue.addToClashingCourseGroups(clashingCourseGroups);
        if (!variable.hasAssignedValue() && variable.hasEmptyDomain()) {
          currentVariable.backtrackingCauseCount++;
          return false;
        }
      }
    }
    return true;
  };

  protected improveAssignedValues = () => {
    let notChangedVariables = 0;
    while(this.variables.length !== notChangedVariables) {
      notChangedVariables = 0;
      for (let variable of this.variables) {
        variable.updateDomainCosts(this.schedulerContextData());
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
    return getVariablePicker(this.variablePickingMethod, this.schedulerContextData()).pick();
  };

  private allVariablesHasAssignedValue = (): boolean => {
    return this.variables.every((variable) => variable.hasAssignedValue());
  };

  protected updateCurrentSchedule = (currentVariable?: Variable): void => {
    this.currentSchedule.update(this.currentAssignedValues());
    if(currentVariable){
      this.updateVisualizer(currentVariable);
    }
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

  private schedulerContextData = (): {
    schedulerContextData: SchedulerContextData;
  } => {
    return {
      schedulerContextData: {
        variables: this.variables,
        currentSchedule: this.currentSchedule,
        softConstraints: this.softConstraints,
        groupOrderingMethods: this.groupOrderingMethods
      }
    }
  };
};


class TempScheduler extends Scheduler{

  constructor(mainScheduler: Scheduler){
      super({softConstraints: mainScheduler.softConstraints, variablePickingMethod: mainScheduler.variablePickingMethod})
      this.variables = this.cloneMainSchedulerVariables(mainScheduler.variables)
      this.updateCurrentSchedule()
  }

  cloneMainSchedulerVariables(mainSchedulerVariables: Variable[]){
      let clonedVariables = mainSchedulerVariables.map((variable) => variable.clone())
      let courseGroupsMap: {[groupID: string]: CourseGroup} = {}
      let variablesMap: {[courseCode: string]: Variable} = {}
      clonedVariables.forEach((variable) => {
          variablesMap[variable.courseCode] = variable
          variable.domain.forEach((cGroup) => {
              courseGroupsMap[cGroup.uniqueID] = cGroup
          })
      })
      mainSchedulerVariables.forEach((variable) => {
          variablesMap[variable.courseCode].assignedValue = variable.assignedValue ? courseGroupsMap[variable.assignedValue.uniqueID] : null;
          variable.domain.forEach((cGroup) => {
              courseGroupsMap[cGroup.uniqueID].clashingCourseGroups = cGroup.clashingCourseGroups.map((clashingGroup) => courseGroupsMap[clashingGroup.uniqueID])
          })
      })
      return clonedVariables
  }

  tryBestDiscarded(){
    let minCost = Number.MAX_SAFE_INTEGER;
    let minCostCourseGroup = null
    let minCostVariable = null
    this.variables.forEach(variable => {
      variable.domain.forEach(courseGroup => {
        if(courseGroup.discarded()){
          courseGroup.updateCost(this.currentSchedule, this.softConstraints)
          const totalGroupCost = courseGroup.cost * courseGroup.discardingCounter
          if(totalGroupCost < minCost){
            minCost = totalGroupCost
            minCostCourseGroup = courseGroup
            minCostVariable = variable
          }
        }
      })
    })
    this.variables.forEach(variable => {
      if(variable.assignedValue.clashingCourseGroups.indexOf(minCostCourseGroup)){
        variable.resetAssignedValue()
      }
    })
    minCostVariable.assignedValue = minCostCourseGroup
    this.updateCurrentSchedule()
    minCostVariable.getClashingCourseGroups(this.currentSchedule);
    for (let variable of this.variables) {
      if (variable !== minCostVariable) {
        const clashingCourseGroups = variable.getClashingCourseGroups(this.currentSchedule);
        minCostVariable.assignedValue.addToClashingCourseGroups(clashingCourseGroups);
        if (!variable.hasAssignedValue() && variable.hasEmptyDomain()) {
          return false;
        }
      }
    }
    this.csp();
    this.improveAssignedValues();
    return this.variables
  }
}