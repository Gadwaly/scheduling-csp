import { CourseGroup, CurrentSchedule } from '.';
import { RegistredGroup } from '../types';

export class Variable {
  courseName: string;
  courseCode: string;
  assignedValue: CourseGroup;
  hasAssignedValue: boolean;
  domain: CourseGroup[];

  constructor(name: string, code: string, domain: CourseGroup[]) {
    this.courseName = name;
    this.domain = domain;
    this.courseCode = code;
    this.assignedValue = this.domain[0];
    this.hasAssignedValue = false;
  };

  filterDomain = (currentSchedule: CurrentSchedule): number[] => {
    let discardedCGroupsIndices: number[] = [];
    this.domain.forEach((courseGroup, index) => {
      if (!courseGroup.discarded) {
        if (courseGroup.clashesWith(currentSchedule)) {
          discardedCGroupsIndices.push(index);
          courseGroup.discarded = true;
        }
      }
    });
    return discardedCGroupsIndices;
  };

  updateWeights = (currentSchedule: CurrentSchedule): void => {
    this.domain.forEach((courseGroup) =>
      courseGroup.updateWeight(currentSchedule)
    );

    this.domain.sort((cGroup1: CourseGroup, cGroup2: CourseGroup) => {
      return cGroup1.weight >= cGroup2.weight ? 1 : -1;
    });
  };

  getRegisteredGroup = (): RegistredGroup => {
    return {
      code: this.courseCode,
      group: this.assignedValue.groupNum,
      tutorial: this.assignedValue.periodsIds.tutorial,
      lab: this.assignedValue.periodsIds.lab,
    }
  };
};
