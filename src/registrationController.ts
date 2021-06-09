import { Scheduler } from './csp/Scheduler';
import { setData } from './csp/services';

export const register = (data: any) => {
  const newData = setData(data);
  const scheduler = new Scheduler(newData);
  return scheduler.schedule();
};
