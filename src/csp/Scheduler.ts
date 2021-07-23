import { ReplaySubject } from "rxjs";
import { Variable, CurrentSchedule, CourseGroup } from "./models";
import { SchedulerData, RegistredGroup, SoftConstraint } from "./types";
import { SchedulerSnapshot } from "./types/SchedulerSnapshot";
import { getVariablePicker, SchedulerContextData } from "./services";
import { ScheduleScoreCalculator } from "./services/ScheduleScoreCalculator";

interface CombinationsMapValue {
  score: number;
  schedule: {
    variable: Variable;
    assignedValue: CourseGroup;
  }[];
}

export class Scheduler {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
  scheduleUpdated: ReplaySubject<any>;
  softConstraints: SoftConstraint[];
  schedulerSnapshots: SchedulerSnapshot[];
  variablePickingMethod: string;
  groupOrderingMethods: string[];
  scheduleStateCounter: number;
  combinationsMap: { [key: string]: CombinationsMapValue };
  configs: { forwardChecking: boolean; improveAssignedValues: boolean };

  constructor(data: SchedulerData) {
    this.variables = data?.variables;
    this.softConstraints = data?.softConstraints;
    this.currentSchedule = new CurrentSchedule();
    this.scheduleUpdated = new ReplaySubject();
    this.setVariablePickingMethod(data?.variablePickingMethod);
    this.setGroupOrderingMethods(data.groupOrderingMethods);
    this.scheduleStateCounter = 0;
    this.combinationsMap = {};
    this.configs = { forwardChecking: true, improveAssignedValues: true };
  }

  setVariablePickingMethod = (method = "min-values"): void => {
    this.variablePickingMethod = method;
  };

  setGroupOrderingMethods = (methods = []): void => {
    this.groupOrderingMethods = methods;
  };

  createSnapshot = () => {
    this.schedulerSnapshots = [
      {
        variables: this.variables.map((variable) => variable.clone()),
        currentSchedule: new CurrentSchedule(),
      },
    ];
  };
  restoreSnapshot = (snapshotIndex: number) => {
    this.variables = this.schedulerSnapshots[snapshotIndex].variables;
    this.currentSchedule =
      this.schedulerSnapshots[snapshotIndex].currentSchedule;
  };

  schedule = (): RegistredGroup[] => {
    let firstCSP = true;
    do {
      if (!firstCSP) {
        // Remove the variable with the highest backtrackingCauseCount
        const maxBacktrackingCauseCount = Math.max(
          ...this.variables.map((variable) => variable.backtrackingCauseCount)
        );
        const variableToBeRemovedCode = this.variables.find(
          (variable) =>
            variable.backtrackingCauseCount === maxBacktrackingCauseCount
        ).courseCode;
        this.variables = this.variables.filter(
          (variable) => variable.courseCode !== variableToBeRemovedCode
        );
        this.variables.forEach((variable) => {
          variable.resetState();
        });
        this.currentSchedule = new CurrentSchedule();
      }
      this.csp(this.configs.forwardChecking);
      firstCSP = false;
    } while (!this.allVariablesHasAssignedValue());
    if(this.configs.improveAssignedValues) {
      this.improveAssignedValues();
    }
    this.updateCurrentSchedule();
    return this.getFinalSchedule();
  };

  private getFinalSchedule = (): RegistredGroup[] => {
    return this.variables.map((variable) => {
      return variable.getRegisteredGroup();
    });
  };

  protected csp = (forwardChecking: boolean): void => {
    if (this.allVariablesHasAssignedValue()) return;
    const currentVariable = this.pickVariable();
    for (let group of currentVariable.availableDomainGroups()) {
      currentVariable.assignedValue = group;
      if (!forwardChecking) {
        if (!this.isClash(currentVariable.assignedValue)) {
          this.updateCurrentSchedule(currentVariable);
          this.updateVisualizer(currentVariable);
          return this.csp(forwardChecking);
        }
        currentVariable.resetAssignedValue();
      } else {
        this.updateCurrentSchedule(currentVariable);
        if (this.forwardCheck(currentVariable))
          return this.csp(forwardChecking);
        this.updateVisualizer(currentVariable);
        currentVariable.resetAssignedValue();
      }
    }
  };

  private isClash = (group: CourseGroup): boolean => {
    return group.clashesWith(this.currentSchedule);
  };

  private forwardCheck = (currentVariable: Variable): boolean => {
    for (let variable of this.variables) {
      if (variable !== currentVariable) {
        const clashingCourseGroups = variable.getClashingCourseGroups(
          this.currentSchedule
        );
        currentVariable.assignedValue.addToClashingCourseGroups(
          clashingCourseGroups
        );
        if (!variable.hasAssignedValue() && variable.hasEmptyDomain()) {
          currentVariable.backtrackingCauseCount++;
          return false;
        }
      }
    }
    return true;
  };

  protected improveAssignedValues = (iterations = 1): void => {
    const beforeScore = this.getCurrentScore();
    for (let i = 0; i < iterations; i++) {
      let previousCombination = this.getCurrentCombination();
      for (let variable of this.variables) {
        this.combinationsMap[this.getCurrentCombination()] =
          this.getCombinationMapValue();
        variable.resetAssignedValue();
        this.updateCurrentSchedule(variable);
        variable.updateDomainCosts(this.schedulerContextData());
        variable.assignedValue = variable.availableDomainGroups()[0];
        this.updateCurrentSchedule(variable);
        this.variables.forEach((variableItem) => {
          if (variableItem !== variable) {
            variable.assignedValue.addToClashingCourseGroups(
              variableItem.getClashingCourseGroups(this.currentSchedule)
            );
          }
        });
        this.updateVisualizer(variable);
      }
      if (previousCombination === this.getCurrentCombination()) {
        break;
      }
    }
    let max = Number.MIN_SAFE_INTEGER;
    let selectedCombinationsMapValue: CombinationsMapValue;
    Object.keys(this.combinationsMap).forEach((key) => {
      const combinationsMapValue = this.combinationsMap[key];
      if (combinationsMapValue.score > max) {
        max = combinationsMapValue.score;
        selectedCombinationsMapValue = combinationsMapValue;
      }
    });
    if (
      this.getCurrentScore() < selectedCombinationsMapValue.score &&
      !this.isCurrentCombination(selectedCombinationsMapValue)
    ) {
      this.variables.forEach((variable) => {
        variable.resetAssignedValue();
      });
      selectedCombinationsMapValue.schedule.forEach((combinationsMapValue) => {
        let currentVariable = combinationsMapValue.variable;
        currentVariable.assignedValue = combinationsMapValue.assignedValue;
        this.updateCurrentSchedule(currentVariable);
        for (let variable of this.variables) {
          if (variable !== currentVariable) {
            const clashingCourseGroups = variable.getClashingCourseGroups(
              this.currentSchedule
            );
            currentVariable.assignedValue.addToClashingCourseGroups(
              clashingCourseGroups
            );
          }
        }
      });
    }
    const finalScore = this.getCurrentScore();
    // if(beforeScore > finalScore)
    //   console.log('ERROR');
  };

  private isCurrentCombination = (
    combination: CombinationsMapValue
  ): boolean => {
    const currentGroups = this.currentAssignedValues();
    return combination.schedule.every((data) => {
      return currentGroups.includes(data.assignedValue);
    });
  };

  private getCombinationMapValue = (): CombinationsMapValue => {
    let result: { variable: Variable; assignedValue: CourseGroup }[] = [];
    this.variables.forEach((variable) => {
      result.push({ variable, assignedValue: variable.assignedValue });
    });
    return {
      schedule: result,
      score: this.getCurrentScore(),
    };
  };

  private getCurrentCombination = (): string => {
    let result: string = "";
    this.currentAssignedValues().forEach((group) => {
      result += group.uniqueID;
    });
    return result;
  };

  private pickVariable = (): Variable => {
    return getVariablePicker(
      this.variablePickingMethod,
      this.schedulerContextData()
    ).pick();
  };

  allVariablesHasAssignedValue = (): boolean => {
    return this.variables.every((variable) => variable.hasAssignedValue());
  };

  protected updateCurrentSchedule = (currentVariable?: Variable): void => {
    this.scheduleStateCounter++;
    this.currentSchedule.update(this.currentAssignedValues());
    if (currentVariable) {
      this.updateVisualizer(currentVariable);
    }
  };

  currentAssignedValues = () => {
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

  schedulerContextData = (): {
    schedulerContextData: SchedulerContextData;
  } => {
    return {
      schedulerContextData: {
        variables: this.variables,
        currentSchedule: this.currentSchedule,
        softConstraints: this.softConstraints,
        groupOrderingMethods: this.groupOrderingMethods,
      },
    };
  };

  getCurrentScore() {
    let scoreCaclculator: ScheduleScoreCalculator = new ScheduleScoreCalculator(
      this.currentSchedule,
      this.softConstraints
    );
    let scoreAfter = scoreCaclculator.calculate();
    // scoreCaclculator.printLogs()
    return scoreAfter;
  }

  getScheduleStates = (): number => {
    let result = this.scheduleStateCounter;
    this.variables.forEach((variable) => {
      variable.domain.forEach((group) => {
        result += group.updateCostCounter;
      });
    });
    return result;
  };

  getCreditHours = (): number => {
    return this.variables.reduce((accumalator, variable) => {
      return accumalator + variable.creditHours;
    }, 0);
  };

  isValidCombination = (): boolean => {
    this.csp(this.configs.forwardChecking);
    return this.allVariablesHasAssignedValue();
  };
}

class TempScheduler extends Scheduler {
  scheduleScoreBefore: number;

  constructor(mainScheduler: Scheduler) {
    super({
      softConstraints: mainScheduler.softConstraints,
      variablePickingMethod: mainScheduler.variablePickingMethod,
    });
    this.variables = this.cloneMainSchedulerVariables(mainScheduler.variables);
    this.updateCurrentSchedule();
  }

  cloneMainSchedulerVariables(mainSchedulerVariables: Variable[]) {
    let clonedVariables = mainSchedulerVariables.map((variable) =>
      variable.clone()
    );
    let courseGroupsMap: { [groupID: string]: CourseGroup } = {};
    let variablesMap: { [courseCode: string]: Variable } = {};
    clonedVariables.forEach((variable) => {
      variablesMap[variable.courseCode] = variable;
      variable.domain.forEach((cGroup) => {
        courseGroupsMap[cGroup.uniqueID] = cGroup;
      });
    });
    mainSchedulerVariables.forEach((variable) => {
      variablesMap[variable.courseCode].assignedValue = variable.assignedValue
        ? courseGroupsMap[variable.assignedValue.uniqueID]
        : null;
      variable.domain.forEach((cGroup) => {
        courseGroupsMap[cGroup.uniqueID].clashingCourseGroups =
          cGroup.clashingCourseGroups.map(
            (clashingGroup) => courseGroupsMap[clashingGroup.uniqueID]
          );
      });
    });
    return clonedVariables;
  }

  tryBestDiscarded() {
    //// Broken
    // Assigns the discarded course group with the lowest
    // then tries to registers the remaining variables
    let maxCost = Number.MAX_SAFE_INTEGER;
    let maxCostCourseGroup = null;
    let maxCostVariable: Variable = null;
    this.variables.forEach((variable) => {
      variable.domain.forEach((courseGroup) => {
        let removedDiscardingAssignments = [];
        if (courseGroup.discarded()) {
          // --Check if the discarding groups have been assigned after me.
          // 1- remove groups which are discarding it
          // 2- Find the assigned value's cost
          // 3- remove its currently assigned value
          // 4- calculate its cost
          // 5- If it's better than the previously assigned value and
          // it's better than the current best replace the current best.
          //
          // courseGroup.updateCost(this.schedulerContextData())
          // variable.assignedValue.updateCost(this.schedulerContextData())
          // const totalGroupCost = courseGroup.cost * courseGroup.discardingCounter
          // if(totalGroupCost < maxCost && (courseGroup.cost > variable.assignedValue.cost)){
          //   maxCost = totalGroupCost
          //   maxCostCourseGroup = courseGroup
          //   maxCostVariable = variable
          // }
        }
      });
    });
    // If didn't find any discarded group that is better than the assigned group
    if (!maxCostVariable) {
      return false;
    }
    // Resets every variable whose assigned value clashes with the best discarded group
    this.variables.forEach((variable) => {
      if (
        variable.assignedValue.clashingCourseGroups.indexOf(maxCostCourseGroup)
      ) {
        variable.resetAssignedValue();
      }
    });
    // Assigning the best discarded group
    maxCostVariable.assignedValue = maxCostCourseGroup;
    this.updateCurrentSchedule();
    for (let variable of this.variables) {
      if (variable !== maxCostVariable) {
        const clashingCourseGroups = variable.getClashingCourseGroups(
          this.currentSchedule
        );
        maxCostVariable.assignedValue.addToClashingCourseGroups(
          clashingCourseGroups
        );
        // if assigning the best discarded group prevented the registartion of another
        // course, terminate and return false
        if (!variable.hasAssignedValue() && variable.hasEmptyDomain()) {
          return false;
        }
      }
    }
    this.csp(this.configs.forwardChecking);
    this.improveAssignedValues();
    this.updateCurrentSchedule();
    if (
      this.getCurrentScore() > this.scheduleScoreBefore &&
      this.allVariablesHasAssignedValue()
    ) {
      return {
        variables: this.variables,
        currentSchedule: this.currentSchedule,
      };
    } else {
      return false;
    }
  }

  tryWorstAssigned() {
    let maxCost = -10000000;
    let maxCostVariable: Variable = null;
    this.variables.forEach((variable) => {
      variable.assignedValue.updateCost(this.schedulerContextData());
      const assignedGroupCost = variable.assignedValue.cost;
      if (assignedGroupCost > maxCost) {
        maxCost = assignedGroupCost;
        maxCostVariable = variable;
      }
    });
    maxCostVariable.resetAssignedValue();
    this.updateCurrentSchedule();
    this.csp(this.configs.forwardChecking);
    this.updateCurrentSchedule();
    if (this.getCurrentScore() > this.scheduleScoreBefore) {
      return {
        variables: this.variables,
        currentSchedule: this.currentSchedule,
      };
    } else {
      return false;
    }
  }
}
