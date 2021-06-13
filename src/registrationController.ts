import { Scheduler } from './csp/Scheduler';
import { setData } from './csp/services';
import { RegistrationData } from './csp/types';

export const register = (data: RegistrationData) => {
  const schedulerData = setData(data);
  const scheduler = new Scheduler(schedulerData);
  return scheduler.schedule();
};
