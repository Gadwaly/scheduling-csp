import { CourseGroup, CurrentSchedule } from '.';
import { RegistredGroup, SoftConstraint } from '../types';

export class Variable {
  courseName: string;
  courseCode: string;
  assignedValue: CourseGroup | null;
  domain: CourseGroup[];

  constructor(name: string, code: string, domain: CourseGroup[]) {
    this.courseName = name;
    this.domain = domain;
    this.courseCode = code;
    this.assignedValue = null;
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

  updateDomainCosts = (currentSchedule: CurrentSchedule, softConstraints: SoftConstraint[]): void => {
    this.domain.forEach((courseGroup) =>
      courseGroup.updateCost(currentSchedule, softConstraints)
    );

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
};
