let selectedPrefernces: any = []

function setSelectedPrefernces(values: any){
  selectedPrefernces = values
}

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

  updateWeights(currentSchedule: CurrentSchedule) {
    this.domain.forEach((courseGroup) =>
      courseGroup.updateWeight(currentSchedule)
    );

    this.domain.sort((cGroup1: CourseGroup, cGroup2: CourseGroup) => {
      return cGroup1.weight >= cGroup2.weight ? 1 : -1;
    });
  }
}

class CourseGroup {
  periods: number[][];
  discarded: boolean;
  weight: number;

  //gaps / instructors

  minDays = (currentSchedule: CurrentSchedule) => {
    let addedDaysCount = 0;
    const busyDays = new Array(6).fill(false);
    for (let i = 0; i < 6; i++) {
      for (let j = i * 12; j < i * 12 + 12; j++) {
        if (currentSchedule.schedule[j]) {
          busyDays[i] = true;
          break;
        }
      }
    }

    this.periods.forEach((period) => {
      let dayIndex = Math.floor(period[0] / 12);
      if (!busyDays[dayIndex]) {
        addedDaysCount++;
        busyDays[dayIndex] = true;
      }
    });

    return addedDaysCount / 6;
  };

  maxDays = (currentSchedule: CurrentSchedule) => {
    return 1 - this.minDays(currentSchedule);
  };

  earlyPeriods = (currentSchedule: CurrentSchedule) => {
    let earliness = 0;
    this.periods.forEach((period) => {
      const day = Math.floor(period[0] / 12),
        from = period[0] - 12 * day + 1;

      earliness += from;
    });

    return earliness / (12 * this.periods.length);
  };

  latePeriods = (currentSchedule: CurrentSchedule) => {
    return 1 - this.earlyPeriods(currentSchedule);
  };

  gaps = (currentSchedule: CurrentSchedule) => {
    let gaps = 0;
    let schedule = [...currentSchedule.schedule];
    let periodDays: number[] = [];

    this.periods.forEach((period) => {
      const day = Math.floor(period[0] / 12),
        from = period[0],
        to = period[1];

      for (let i = from; i <= to; i++) schedule[i] = true;

      periodDays.push(day);
    });

    periodDays.forEach((day) => {
      let firstPeriod = day * 12 + 11,
        lastPeriod = day * 12;

      for (let i = day * 12; i < day * 12 + 12; i++) {
        if (schedule[i]) {
          if (firstPeriod > i) firstPeriod = i;
          if (lastPeriod < i) lastPeriod = i;
        }
      }

      for (let i = firstPeriod; i < lastPeriod; i++) if (!schedule[i]) gaps++;
    });
    return gaps / (11 * this.periods.length);
  };

  gapsPlus = (currentSchedule: CurrentSchedule) => {
    return 1 - this.gaps(currentSchedule);
  };

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
    const softConstraints = selectedPrefernces.map((pref: any) => {
      return {priority: 10, constraint: eval(`this.${pref}`)}
    })
    // const softConstraints = [
    //   // { priority: 3, constraint: this.earlyPeriods },
    //   { priority: 100, constraint: this.minDays },
    //   { priority: 10, constraint: this.gaps },
    // ];

    this.weight = softConstraints.reduce((accumalator: any, constraint: any) => {
      return (
        accumalator +
        constraint.priority * constraint.constraint(currentSchedule)
      );
    }, 0);
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

export { Variable, CourseGroup, CurrentSchedule, setSelectedPrefernces };
