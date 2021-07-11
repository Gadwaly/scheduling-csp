import { CourseGroup, CurrentSchedule } from '.';
import { RegistredGroup } from '../types';
import { SchedulerContextData } from '../services';

export class Variable {
  courseName: string;
  courseCode: string;
  assignedValue: CourseGroup | null;
  domain: CourseGroup[];
  backtrackingCauseCount: number;

  constructor(name: string, code: string, domain: CourseGroup[]) {
    this.courseName = name;
    this.domain = domain;
    this.courseCode = code;
    this.assignedValue = null;
    this.backtrackingCauseCount = 0;
  };

  resetAssignedValue = () => {
    this.assignedValue.resetClashingCourseGroups();
    this.assignedValue = null;
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

  clone = (): Variable => {
    let clonedVariable = Object.assign(new Variable(null, null, []), JSON.parse(JSON.stringify(this)))
    clonedVariable.assignedValue = this.assignedValue?.clone()
    clonedVariable.domain = this.domain.map(cGroup => cGroup.clone())
    return clonedVariable
  }
};
