let selectedPrefernces: any = [];

const setPreferences = (values: any) => {
  if (values?.earlyLate) {
    const earlyLate = values.earlyLate.value.toLowerCase();
    const value = earlyLate == "early" ? "earlyPeriods" : "latePeriods";
    selectedPrefernces.push({
      constraint: `this.${value}`,
      priority: earlyLate.order,
    });
  }
  // if(values?.daysOff) {
  //   const daysOff = values.daysOff.toLowerCase();
  //   const value = daysOff == 'early' ? 'earlyPeriods': 'latePeriods';
  //   selectedPrefernces.push({ constraint: `this.${value}`, priority: daysOff.order });
  // }
  if (values?.gaps) {
    const gaps = values.gaps.value.toLowerCase();
    const value = gaps == "min" ? "gaps" : "gapsPlus";
    selectedPrefernces.push({
      constraint: `this.${value}`,
      priority: gaps.order,
    });
  }
  if (values?.minMaxDays) {
    const minMaxDays = values.minMaxDays.value.toLowerCase();
    const value = minMaxDays == "min" ? "minDays" : "maxDays";
    selectedPrefernces.push({
      constraint: `this.${value}`,
      priority: minMaxDays.order,
    });
  }
};

const dayNumber: any = {
  saturday: 0,
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
};

class Variable {
  courseName: string;
  courseCode: string;
  assignedValue: any;
  domain: CourseGroup[];

  public constructor(name: string, code: string, domain: any) {
    this.assignedValue = null;
    this.domain = domain;
    this.courseName = name;
    this.courseCode = code;
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

  getRegisteredGroup() {
    return {
      code: this.courseCode,
      group: this.assignedValue.groupNum,
      tutorial: this.assignedValue.periodsIds.tutorial,
      lab: this.assignedValue.periodsIds.lab,
    };
  }
}

class CourseGroup {
  periods: number[][];
  discarded: boolean;
  weight: number;
  periodsIds: any;
  groupNum: any;

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

  public constructor(groupNum: any, group: any) {
    this.groupNum = groupNum;
    group = group.filter((period: any) => period !== undefined);
    this.periodsIds = {
      tutorial: null,
      lab: null,
    };
    this.periods = group.map((period: any) => {
      let dayBase = dayNumber[period.day] * 12;
      if (period.type) {
        this.periodsIds[period.type] = period.id;
      }
      return [dayBase + (period.from - 1), dayBase + (period.to - 1)];
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
    const softConstraints = selectedPrefernces;
    this.weight = softConstraints.reduce(
      (accumalator: any, constraint: any) => {
        return (
          accumalator +
          constraint.priority * constraint.constraint(currentSchedule)
        );
      },
      0
    );
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

export { Variable, CourseGroup, CurrentSchedule, setPreferences };
