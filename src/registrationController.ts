import { setVariables } from './data/timetable';
import { setPreferences } from './csp/models';
import { csp, currentSchedule } from './csp/csp';

export const register = (data: any) => {
  setVariables(data.courses);
  setPreferences(data.preferences);
  csp();
  return currentSchedule.getPeriodsObjects();
};
