import { Variable } from '../models';
import { SelectedPreference } from '.';

export interface SchedulerData {
  variables: Variable[];
  selectedPreferences: SelectedPreference[];
  nextMethod?: string;
};
