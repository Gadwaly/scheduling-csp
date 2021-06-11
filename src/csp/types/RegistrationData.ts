export interface RegistrationData {
  table: {
    [key: string]: {
      name: string,
      creditHours: number | string,
      hasTutorial: boolean,
      hasLab: boolean,
      groups: {
        [key: string]: {
          instructor: number | string,
          lectures: [
            {
              day: DayValue,
              from: number | string
              to: number | string
            }
          ],
          tutorials?: {
            [key: string]: {
              day: DayValue,
              from: number | string
              to: number | string
            }
          },
          labs?: {
            [key: string]: {
              day: DayValue,
              from: number | string
              to: number | string
            }
          }
        }
      }
    }
  },
  preferences?: {
    courses?: {
      [key: string]: {
        instructor: number | string
      }
    },
    earlyLate?: {
      value: EarlyLateValues | null,
      order: number | string
    },
    offDays?: {
      value: DayValue[],
      order: number | string
    },
    gaps?: {
      value: GapsValues | null,
      order: number | string
    }
  }
};

type EarlyLateValues = 'earyl' | 'late';
type DayValue = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
type GapsValues = 'min' | 'max';
