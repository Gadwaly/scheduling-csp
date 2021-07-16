import { PreferencesData } from '../csp/types';
import { setData } from '../csp/services';
import { Scheduler } from '../csp/Scheduler';
import { createRegistrationData } from './utils';

export const validate = (data: { preferences: PreferencesData }): boolean => {
  const registrationData = createRegistrationData(data.preferences);
  const schedulerData = setData(registrationData);
  const scheduler = new Scheduler(schedulerData);
  return scheduler.isValidCombination();
};
