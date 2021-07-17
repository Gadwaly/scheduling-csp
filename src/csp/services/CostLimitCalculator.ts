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
    this.softConstraints.forEach((softConstraint) => {
      switch (softConstraint.type) {
        case 'courseInstructor':
          LIMIT += 1 * configs.weights.instructor * weightsMap[softConstraint.priority];
          break;
        case 'minDays' || 'maxDays':
          LIMIT += 1 * numberOfPeriods * configs.weights.minOrMaxDays * weightsMap[softConstraint.priority];
          break;
        case 'earlyPeriods' || 'latePeriods':
          LIMIT += 12 * numberOfPeriods * configs.weights.earlyOrLate * weightsMap[softConstraint.priority];
          break;
        case 'gaps' || 'gapsPlus':
          LIMIT += 10 * numberOfPeriods * configs.weights.gaps * weightsMap[softConstraint.priority];
          break;
        case 'daysOff':
          LIMIT += 1 * numberOfPeriods * configs.weights.offDays * weightsMap[softConstraint.priority];
          break;
      }
    });
    return LIMIT;
  };
};
