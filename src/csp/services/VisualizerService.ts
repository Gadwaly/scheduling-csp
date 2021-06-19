import { ReplaySubject, Subject } from 'rxjs';

const scheduleUpdated: ReplaySubject<any> = new ReplaySubject();
const startCSP: Subject<any> = new Subject();

export { scheduleUpdated, startCSP }
