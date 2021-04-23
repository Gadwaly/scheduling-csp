import { Variable } from "../csp/models";

import { ReplaySubject } from "rxjs";

const scheduleUpdated: ReplaySubject<any> = new ReplaySubject();

export { scheduleUpdated }