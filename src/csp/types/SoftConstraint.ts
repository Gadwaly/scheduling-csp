export interface SoftConstraint {
  priority: number;
  type: ConstraintType;
};

type ConstraintType = 'minDays' | 'maxDays' | 'earlyPeriods' | 'latePeriods' | 'gaps' | 'gapsPlus';
