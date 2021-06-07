import { setVariables } from "./data/timetable";
import { setPreferences } from "./csp/models";
import { csp, currentSchedule, getFinalSchedule } from "./csp/csp";

export const register = (data: any) => {
  setVariables(data.table);
  setPreferences(data.preferences);
  csp();
  return getFinalSchedule();
};
