import { courses } from "./data/timetable";

class Variable {
  course_name: string;
  assigned_value: any;
  domain: CourseGroup[];

  public constructor(name: string, domain: any) {
    this.assigned_value = null;
    this.domain = domain;
    this.course_name = name;
  }

  public pickFromDomain() {
    // return highest weight
    this.assigned_value = this.domain.find((value) => {
      !value.discarded;
    });
  }

  filterDomain(currentSchedule: CourseGroup[]) {
    // this.domain = this.domain.filter((cGroup) => {
    //   // Check clash
    // });
    return this.domain;
  }
}

class CourseGroup {
  periods: number[][];
  days: []; // ?
  discarded: boolean;
  weight: number;

  public constructor(group: []) {
    this.periods = group.map((period) => {
      let dayBase = period[0] * 12;
      return [dayBase + period[1], dayBase + period[2]];
    });
    this.discarded = false;
    this.days = [];
    this.weight = 0;
  }
}

//   let variables: Variable[] = []
//   courses.forEach(course => {
//       const groups = course.groups.map(group => {
//         Object.values(group).forEach(sessionType => {

//         })
//         // assign the variables
//       })
//   })

const pickVariableToAssign = () => {
  let min = 1000000;
  let selectedVariable: Variable = new Variable("asdsa", "adadsa");
  variables.forEach((variable) => {
    if (!variable.assigned_value && variable.domain.length < min) {
      selectedVariable = variable;
      min = variable.domain.length;
    }
  });
  return selectedVariable;
};

const forwardChecking = () => {
  let discardedValues: any[] = [];
  let failed = false;
  const currentSchedule: CourseGroup[] = variables
    .filter((variable) => variable.assigned_value)
    .map((variable) => {
      return variable.assigned_value;
    });
  variables.forEach((variable, index) => {
    if (!variable.assigned_value) {
      const filteredDomain: CourseGroup[] = variable.filterDomain(
        currentSchedule
      );
      if (filteredDomain.length == 0) {
        failed = true;
      }
      discardedValues.push([index, filteredDomain]);
    }
  });
  return {
    failed,
    discardedValues,
  };
};

const variables: Variable[] = [];

const csp = () => {
  const all_assigned = variables.every((variable: Variable) => {
    variable.assigned_value;
  });
  if (all_assigned) {
    return true;
  }
  const currentVariable: Variable = pickVariableToAssign();
  currentVariable.domain
    .filter((value) => !value.discarded)
    .forEach((value) => {
      currentVariable.assigned_value = value;
      const fcOutput = forwardChecking();
      if (!fcOutput.failed) {
        return csp();
      }
      // backtrack
      // reset current variable assignment
      // reset discarded values from fcOutput.discardedValues
    });
};

export { Variable };
