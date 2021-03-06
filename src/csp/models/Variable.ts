import { CourseGroup, CurrentSchedule } from '.';
import { RegistredGroup } from '../types';
import { SchedulerContextData } from '../services';

export class Variable {
  courseName: string;
  courseCode: string;
  creditHours: number;
  assignedValue: CourseGroup | null;
  domain: CourseGroup[];
  backtrackingCauseCount: number;

  constructor(name: string, code: string, domain: CourseGroup[], creditHours: number) {
    this.courseName = name;
    this.domain = domain;
    this.courseCode = code;
    this.creditHours = creditHours;
    this.assignedValue = null;
    this.backtrackingCauseCount = 0;
  };

  resetAssignedValue = () => {
    if(this.assignedValue){
      this.assignedValue.resetClashingCourseGroups();
      this.assignedValue = null;
    }
  }

  getClashingCourseGroups = (currentSchedule: CurrentSchedule): CourseGroup[] => {
    let clashingCourseGroups: CourseGroup[] = [];
    this.domain.forEach((courseGroup) => {
      if (!currentSchedule.scheduleGroups.includes(courseGroup) && courseGroup.clashesWith(currentSchedule)) {
        clashingCourseGroups.push(courseGroup);
      }
    });
    return clashingCourseGroups;
  };

  updateDomainCosts = (data: { schedulerContextData: SchedulerContextData }): void => {
    data.schedulerContextData.currentVariable = this;
    this.domain.forEach((courseGroup) => courseGroup.updateCost(data));

    this.domain.sort((group1: CourseGroup, group2: CourseGroup) => {
      return group1.cost - group2.cost;
    });
  };

  hasEmptyDomain = (): boolean => {
    return this.domain.every((courseGroup) => courseGroup.discarded());
  };

  availableDomainGroups = (): CourseGroup[] => this.domain.filter((group) => !group.discarded());

  hasAssignedValue = (): boolean => this.assignedValue != null;

  getRegisteredGroup = (): RegistredGroup => {
    return {
      code: this.courseCode,
      group: this.assignedValue.groupNum,
      tutorial: this.assignedValue.periodsIds.tutorial,
      lab: this.assignedValue.periodsIds.lab,
    }
  };

  resetState = (): void => {
    this.resetAssignedValue()
    this.backtrackingCauseCount = 0
  }

  clone = (): Variable => {
    let clonedVariable = Object.assign(new Variable(null, null, [], null), JSON.parse(JSON.stringify(this)))
    clonedVariable.assignedValue = this.assignedValue?.uniqueID
    clonedVariable.domain = this.domain.map(cGroup => cGroup.clone())
    return clonedVariable
  }
};
