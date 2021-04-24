class Variable {
  courseName: string;
  assignedValue: any;
  domain: CourseGroup[];

  public constructor(name: string, domain: any) {
    this.assignedValue = null;
    this.domain = domain;
    this.courseName = name;
  }

  public pickFromDomain() {
    this.assignedValue = this.domain.find((value) => {
      return !value.discarded;
    });
  }

  filterDomain(currentSchedule: CurrentSchedule) {
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

  updateWeights(currentSchedule: CurrentSchedule) {}
}

class CourseGroup {
  periods: number[][];
  discarded: boolean;
  weight: number;

  constraint1(currentSchedule: CurrentSchedule) {
    const busyDays = new Array(6).fill(false)
    
  }

  constraint2(currentSchedule: CurrentSchedule) {
    return 20
  }

  public constructor(group: any) {
    group = group.filter((period: any) => period !== undefined);
    this.periods = group.map((period: any) => {
      let dayBase = period[0] * 12;
      return [dayBase + (period[1] - 1), dayBase + (period[2] - 1)];
    });
    this.discarded = false;
    this.weight = 0;
  }

  clashesWith(currentSchedule: CurrentSchedule) {
    return this.periods.some((period) => {
      for (let i = period[0]; i < period[1] + 1; i++) {
        if (currentSchedule.schedule[i]) {
          return true;
        }
      }
      return false;
    });
  }

  updateWeight(currentSchedule: CurrentSchedule) {
    const softConstraints = [
      { priority: 3, constraint: this.constraint1 },
      { priority: 3, constraint: this.constraint2 },
    ];

    this.weight = softConstraints.reduce(( accumalator, constraint )  => {
      return accumalator + (constraint.priority * constraint.constraint(currentSchedule))
    }, 0)
  }
}

class CurrentSchedule {
  schedule: boolean[] = [];
  scheduleGroups: CourseGroup[] = [];

  update(groups: CourseGroup[]) {
    this.scheduleGroups = groups;
    this.schedule = new Array(72).fill(false);
    groups.forEach((group) => {
      group.periods.forEach((period) => {
        for (let i = period[0]; i < period[1] + 1; i++) {
          this.schedule[i] = true;
        }
      });
    });
  }
}

export { Variable, CourseGroup, CurrentSchedule };
