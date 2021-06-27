export interface SoftConstraint {
  priority: number;
  type: ConstraintType;
  param?: any;
}

type ConstraintType =
  | "minDays"
  | "maxDays"
  | "earlyPeriods"
  | "latePeriods"
  | "gaps"
  | "gapsPlus"
  | "daysOff"
  | "courseInstructor";
