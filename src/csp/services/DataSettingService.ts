import { CourseGroup, Variable } from '../models';
import { RegistrationData, CoursesData, PreferencesData, SelectedPreference, SchedulerData } from '../types';

export let selectedPreferences: SelectedPreference[];
let variables: Variable[];

export const setData = (data: RegistrationData): SchedulerData => {
  selectedPreferences = [];
  variables = [];
  setVariables(data.table);
  setPreferences(data.preferences);
  return { variables, selectedPreferences };
};

const setVariables = (courses: CoursesData): void => {
  const courseCodes = Object.keys(courses);
  courseCodes.forEach((courseCode) => {
    let course = courses[courseCode];
    let groups: CourseGroup[] = [];
    const groupNumbers = Object.keys(course.groups);
    groupNumbers.forEach((groupNum: string) => {
      let group = course.groups[groupNum];
      const tutorialIds = Object.keys(group.tutorials);
      const labIds = Object.keys(group.labs);
      if (course.hasTutorial && course.hasLab) {
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[0]],
              id: tutorialIds[0],
              type: 'tutorial',
            },
            { ...group.labs[labIds[0]], id: labIds[0], type: 'lab' },
          ])
        );
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[1]],
              id: tutorialIds[1],
              type: 'tutorial',
            },
            { ...group.labs[labIds[0]], id: labIds[0], type: 'lab' },
          ])
        );
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[0]],
              id: tutorialIds[0],
              type: 'tutorial',
            },
            { ...group.labs[labIds[1]], id: labIds[1], type: 'lab' },
          ])
        );
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[1]],
              id: tutorialIds[1],
              type: 'tutorial',
            },
            { ...group.labs[labIds[1]], id: labIds[1], type: 'lab' },
          ])
        );
      } else if (course.hasLab) {
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            { ...group.labs[labIds[0]], id: labIds[0], type: 'lab' },
          ])
        );
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            { ...group.labs[labIds[1]], id: labIds[1], type: 'lab' },
          ])
        );
      } else if (course.hasTutorial) {
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[0]],
              id: tutorialIds[0],
              type: 'tutorial',
            },
          ])
        );
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[1]],
              id: tutorialIds[1],
              type: 'tutorial',
            },
          ])
        );
      } else {
        groups.push(
          new CourseGroup(groupNum, [group.lectures[0], group.lectures[1]])
        );
      }
    });
    variables.push(new Variable(course.name, courseCode, groups));
  });
};

const setPreferences = (values: PreferencesData): void => {
  if (values?.earlyLate) {
    const earlyLate = values.earlyLate.value.toLowerCase();
    const value = earlyLate == 'early' ? 'earlyPeriods' : 'latePeriods';
    const order = values.earlyLate.order;
    selectedPreferences.push({
      constraint: `${value}`,
      priority: order,
    });
  }
  if (values?.gaps) {
    const gaps = values.gaps.value.toLowerCase();
    const value = gaps == 'min' ? 'gaps' : 'gapsPlus';
    const order = values.gaps.order;
    selectedPreferences.push({
      constraint: `${value}`,
      priority: order,
    });
  }
  if (values?.minMaxDays) {
    const minMaxDays = values.minMaxDays.value.toLowerCase();
    const value = minMaxDays == 'min' ? 'minDays' : 'maxDays';
    const order = values.minMaxDays.order;
    selectedPreferences.push({
      constraint: `${value}`,
      priority: order,
    });
  }
};
