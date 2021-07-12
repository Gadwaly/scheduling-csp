import { PreferencesData, RegistrationData } from '../csp/types';
import { Scheduler } from '../csp/Scheduler';
import allCourses from '../csp/allCourses.json';
import { setData } from '../csp/services';
import { ScheduleScoreCalculator } from '../csp/services/ScheduleScoreCalculator';

export const benchmark = (data: { preferences: PreferencesData, variablePickingMethod: string }) => {
  const registrationData = createRegistrationData(data.preferences);
  let t1 = performance.now();
  const schedulerData = setData(registrationData, data.variablePickingMethod);
  let t2 = performance.now();
  const dataSettingTime = t2 - t1;
  const scheduler = new Scheduler(schedulerData);
  t1 = performance.now();
  scheduler.schedule();
  t2 = performance.now();
  const processingTime = t2 - t1;
  const score = new ScheduleScoreCalculator(scheduler.currentSchedule, scheduler.softConstraints).calculate();
  return {
    score,
    dataSettingTime,
    processingTime,
    visits: scheduler.scheduleStateCounter
  };
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