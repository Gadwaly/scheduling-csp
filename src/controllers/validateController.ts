import { PreferencesData, RegistrationData } from '../csp/types';
import allCourses from '../csp/allCourses.json';
import { setData } from '../csp/services';
import { Scheduler } from '../csp/Scheduler';

export const validate = (data: { preferences: PreferencesData }): boolean => {
  const registrationData = createRegistrationData(data.preferences);
  const schedulerData = setData(registrationData);
  const scheduler = new Scheduler(schedulerData);
  return scheduler.isValidCombination();
};

const createRegistrationData = (preferences: PreferencesData): RegistrationData => {
  const coursesArray = preferences.courses;
  const courses = [];
  coursesArray.forEach((course) => {
    courses.push({ [course.code]: allCourses[course.code] });
  });
  const table = Object.assign({}, ...courses);
  return { table, preferences };
};
