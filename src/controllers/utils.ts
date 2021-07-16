import { PreferencesData, RegistrationData } from '../csp/types';
import allCourses from '../csp/allCourses.json';

export const createRegistrationData = (preferences: PreferencesData): RegistrationData => {
  const coursesArray = preferences.courses;
  const courses = [];
  coursesArray.forEach((course) => {
    courses.push({ [course.code]: allCourses[course.code] });
  });
  const table = Object.assign({}, ...courses);
  return { table, preferences };
};
