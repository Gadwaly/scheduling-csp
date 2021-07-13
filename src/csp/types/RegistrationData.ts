import { DayValue, Period } from ".";

export interface RegistrationData {
  table: CoursesData;
  preferences: PreferencesData;
}

export interface CoursesData {
  [key: string]: {
    name: string;
    creditHours: number | string;
    hasTutorial: boolean;
    hasLab: boolean;
    groups: {
      [key: string]: {
        instructor: number | string;
        lectures: Period[];
        tutorials: {
          [key: string]: Period;
        };
        labs: {
          [key: string]: Period;
        };
      };
    };
  };
}

export interface PreferencesData {
  courses?: [
    { 
      code: string;
      instructor: string | number;
    }
  ];
  earlyOrLate?: {
    value: EarlyLateValues;
    order: number | string;
  };
  offDays?: {
    value: DayValue[];
    order: number | string;
  };
  gaps?: {
    value: GapsValues;
    order: number | string;
  };
  minOrMaxDays?: {
    value: MinMaxDayesValues;
    order: number | string;
  };
}

type EarlyLateValues = "early" | "late";
type GapsValues = "min" | "max";
type MinMaxDayesValues = "min" | "max";
