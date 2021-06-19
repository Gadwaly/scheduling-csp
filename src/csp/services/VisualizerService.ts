import { ReplaySubject, Subject } from 'rxjs';

const scheduleUpdated: ReplaySubject<any> = new ReplaySubject();

export { scheduleUpdated }
