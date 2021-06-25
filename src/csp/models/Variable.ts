import { CourseGroup, CurrentSchedule } from '.';
import { RegistredGroup, SoftConstraint } from '../types';

export class Variable {
  courseName: string;
  courseCode: string;
  assignedValue: CourseGroup | null;
  domain: CourseGroup[];
  assignedValueClashes: CourseGroup[];

  constructor(name: string, code: string, domain: CourseGroup[]) {
    this.courseName = name;
    this.domain = domain;
    this.courseCode = code;
    this.assignedValue = null;
    this.assignedValueClashes = [];
  };

  setAssigendValuesClashesWith = (filterdDomain: CourseGroup[]) => {
    filterdDomain.forEach((value) => value.incrementDiscardingCounter());
    this.assignedValueClashes = filterdDomain;
  }

  addAssignedValuesClashesWith = (filterdDomain: CourseGroup[]) => {
    this.assignedValueClashes.push(...filterdDomain);
    filterdDomain.forEach((value) => value.incrementDiscardingCounter());
  }

  resetAssignedValue = () => {
    this.assignedValue = null;
    this.clearAssignedValuesClashesWith();
  }

  clearAssignedValuesClashesWith = () => {
    this.assignedValueClashes.forEach((value) => value.decrementDiscardingCounter());
    this.assignedValueClashes = [];
  }

  filterDomain = (currentSchedule: CurrentSchedule): CourseGroup[] => {
    let discardedCourseGroups: CourseGroup[] = [];
    this.domain.forEach((courseGroup) => {
      if (!currentSchedule.scheduleGroups.includes(courseGroup) && courseGroup.clashesWith(currentSchedule)) {
        discardedCourseGroups.push(courseGroup);
      }
    });
    return discardedCourseGroups;
  };

  updateWeights = (currentSchedule: CurrentSchedule, softConstraints: SoftConstraint[]): void => {
    this.domain.forEach((courseGroup) =>
      courseGroup.updateWeight(currentSchedule, softConstraints)
    );

    this.domain.sort((cGroup1: CourseGroup, cGroup2: CourseGroup) => {
      return cGroup1.weight - cGroup2.weight;
    });
  };

  test = (group: CourseGroup): number => {
    return group.discarded() ? 1 : -1;
  }

  hasEmptyDomain = (): boolean => {
    return this.domain.every((courseGroup) => courseGroup.discarded());
  };

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
