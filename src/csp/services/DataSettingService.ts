import { CourseGroup, Variable } from "../models";
import {
  RegistrationData,
  CoursesData,
  PreferencesData,
  SchedulerData,
  SoftConstraint,
  Period
} from "../types";

export const setData = (data: RegistrationData, variablePickingMethod?: string): SchedulerData => {
  let variables: Variable[] = setVariables(data.table);
  let softConstraints: SoftConstraint[] = setSoftConstraints(data.preferences);
  return { variables, softConstraints, variablePickingMethod };
};

const setVariables = (courses: CoursesData): Variable[] => {
  let variables: Variable[] = [];
  const courseCodes = Object.keys(courses);
  courseCodes.forEach((courseCode) => {
    const course = courses[courseCode];
    let groups: CourseGroup[] = [];
    const groupNumbers = Object.keys(course.groups);
    groupNumbers.forEach((groupNum: string) => {
      const group = course.groups[groupNum];
      const tutorialIds = course.hasTutorial ? Object.keys(group.tutorials) : [ 'no-tutorials' ];
      const labIds = course.hasLab ? Object.keys(group.labs) : [ 'no-labs' ];
      for (let i = 0; i < tutorialIds.length; i++) {
        for (let j = 0; j < labIds.length; j++) {
          let periods: Period[] = [];
          if (tutorialIds[i] !== 'no-tutorials') {
            periods.push({
              ...group.tutorials[tutorialIds[i]],
              id: tutorialIds[i],
              type: 'tutorial'
            });
          }
          if (labIds[i] !== 'no-labs') {
            periods.push({
              ...group.labs[labIds[i]],
              id: labIds[i],
              type: 'lab'
            });
          }
          groups.push(
            new CourseGroup(
              groupNum,
              [
                group.lectures[0],
                group.lectures[1],
                ...periods
              ],
              group.instructor.toString(),
              course.name
            )
          );
        }
      }
    });
    variables.push(new Variable(course.name, courseCode, groups));
  });
  return variables;
};

export const setSoftConstraints = (preferencesData: PreferencesData): SoftConstraint[] => {
  let softConstraints: SoftConstraint[] = [];
  const preferencesNames = Object.keys(preferencesData);
  for (let i = 0; i < preferencesNames.length; i++) {
    const preferenceName = preferencesNames[i];
    const preference = preferencesData[preferenceName];
    if (typeof(preference.value) === 'string') {
      softConstraints.push({
        type: preferencesMap[preferenceName][preference.value],
        priority: +preference.order,
      });
    } else {
      softConstraints.push({
        type: preferencesMap[preferenceName],
        priority: +preference.order,
        param: preference.value
      });
    }
  }
  return softConstraints;
};

const preferencesMap = {
  'earlyOrLate': {
    'early': 'earlyPeriods',
    'late': 'latePeriods'
  },
  'gaps': {
    'min': 'gaps',
    'max': 'gapsPlus'
  },
  'minMaxDays': {
    'min': 'minDays',
    'max': 'maxDays'
  },
  'daysOff': 'daysOff',
  'courseInstructor': 'courseInstructor'
};
