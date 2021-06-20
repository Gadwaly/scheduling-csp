import { Variable } from '../models';
import { SoftConstraint } from '.';

export interface SchedulerData {
  variables: Variable[];
  softConstraints: SoftConstraint[];
  nextMethod?: string;
};
