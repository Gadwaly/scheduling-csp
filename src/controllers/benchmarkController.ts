import { PreferencesData, RegistrationData } from '../csp/types';
import { Scheduler } from '../csp/Scheduler';
import allCourses from '../csp/allCourses.json';
import { setData } from '../csp/services';
import { ScheduleScoreCalculator } from '../csp/services/ScheduleScoreCalculator';

export const benchmark = (preferences: PreferencesData) => {
  const registrationData = createRegistrationData(preferences);
  let t1 = performance.now();
  const schedulerData = setData(registrationData, 'average-domain-costs');
  let t2 = performance.now();
  const dataSettingTime = t2 - t1;
  const scheduler = new Scheduler(schedulerData);
  t1 = performance.now();
  scheduler.schedule();
  t2 = performance.now();
  const CSPTime = t2 - t1;
  const score = new ScheduleScoreCalculator(scheduler.currentSchedule, scheduler.softConstraints).calculate();
  return {
    score,
    dataSettingTime,
    CSPTime,
    scheduleStates: scheduler.scheduleStateCounter
  };
};

const createRegistrationData = (preferences: PreferencesData): RegistrationData => {
  const courses = [];
  const courseCodes = Object.keys(preferences.courses);
  courseCodes.forEach((courseCode) => {
    courses.push({ [courseCode]: allCourses[courseCode] });
  });
  const table = Object.assign({}, ...courses);
  return { table, preferences };
};
