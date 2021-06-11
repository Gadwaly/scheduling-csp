import { CourseGroup, CurrentSchedule } from '.';

export class Variable {
  courseName: string;
  courseCode: string;
  assignedValue: any;
  domain: CourseGroup[];

  constructor(name: string, code: string, domain: any) {
    this.assignedValue = null;
    this.domain = domain;
    this.courseName = name;
    this.courseCode = code;
  }

  pickFromDomain = (): void => {
    this.assignedValue = this.domain.find((value) => {
      return !value.discarded;
    });
  }

  filterDomain = (currentSchedule: CurrentSchedule): number[] => {
    let discardedCGroupsIndices: number[] = [];
    this.domain.forEach((courseGroup, index) => {
      if (!courseGroup.discarded) {
        if (courseGroup.clashesWith(currentSchedule)) {
          courseGroup.discarded = true;
          discardedCGroupsIndices.push(index);
        }
      }
    });
    return discardedCGroupsIndices;
  }

  updateWeights = (currentSchedule: CurrentSchedule): void => {
    this.domain.forEach((courseGroup) =>
      courseGroup.updateWeight(currentSchedule)
    );

    this.domain.sort((cGroup1: CourseGroup, cGroup2: CourseGroup) => {
      return cGroup1.weight >= cGroup2.weight ? 1 : -1;
    });
  }

  getRegisteredGroup() {
    return {
      code: this.courseCode,
      group: this.assignedValue.groupNum,
      tutorial: this.assignedValue.periodsIds.tutorial,
      lab: this.assignedValue.periodsIds.lab,
    };
  }
}
