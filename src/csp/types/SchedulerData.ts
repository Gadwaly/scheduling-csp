import { Variable } from '../models';
import { SoftConstraint } from '.';

export interface SchedulerData {
  variables: Variable[];
  softConstraints: SoftConstraint[];
  variablePickingMethod?: string;
  groupOrderingMethods?: string[];
};
