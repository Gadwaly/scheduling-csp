import { DayValue } from '.';

export interface Period {
  day: DayValue;
  from: number;
  to: number;
  id?: string;
  type?: PeriodTypeValues;
};


type PeriodTypeValues = 'tutorial' | 'lab';
