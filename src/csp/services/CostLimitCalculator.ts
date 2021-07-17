import { SoftConstraint } from "../types";
import configs from '../configs.json';
import { weightsMap } from '.';

export class CostLimitCalculator {
  private softConstraints: SoftConstraint[];

  constructor(softConstraints: SoftConstraint[]) {
    this.softConstraints = softConstraints;
  };

  calculate = (numberOfPeriods = 4): number => {
    let LIMIT = 0;
    LIMIT += 1 * configs.weights.instructor;
    LIMIT += 1 * numberOfPeriods * configs.weights.minOrMaxDays;
    LIMIT += 12 * numberOfPeriods * configs.weights.earlyOrLate;
    LIMIT += 10 * numberOfPeriods * configs.weights.gaps;
    LIMIT += 1 * numberOfPeriods * configs.weights.offDays;
    return LIMIT;
  };
};
