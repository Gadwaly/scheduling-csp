import { CurrentSchedule, Variable } from '../models';

export interface SchedulerSnapshot {
  variables: Variable[];
  currentSchedule: CurrentSchedule;
};
