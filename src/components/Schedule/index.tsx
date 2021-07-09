import Period, { Day } from "./Period";
import { Variable} from "../../csp/models";
import ScheduleRow from "./SceduleRow";

interface ScheduleProps {
  variables: any;
}

const Schedule = ({ variables }: ScheduleProps) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Day</th>
          {[...Array(12)].map((value: undefined, index: number) => {
            return <th key={index}>{index + 1}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {getTimeTable(getSchedule(variables)).map((period, index) => (
          <ScheduleRow key={index} schedule={period} day={Day[index]} />
        ))}
      </tbody>
    </table>
  );
};

const getSchedule = (variables: Variable[]): Period[] => {
  const schedule: Period[] = [];
  let i = 0;
  variables.forEach((variable, index) => {
    if (variable.assignedValue) {
      const periods = variable.assignedValue.periods;
      periods.forEach((period: number[]) => {
        const day = Math.floor(period[1] / 12),
          from = period[0] - 12 * day + 1,
          to = period[1] - 12 * day + 1;

        schedule.push({
          id: i++,
          day,
          from,
          to,
          course_name: variable.courseName,
          instructor: variable.assignedValue.instructor
        });
      });
    }
  });
  return schedule;
};

const getTimeTable = (schedule: Period[]): Period[][] => {
  const ordered = schedule.sort((a, b) => {
    return a.day > b.day || (a.day === b.day && a.from > b.from) ? 1 : -1;
  });
  const res: Period[][] = [];
  for (let i = 0; i < 7; i++) res[i] = [];

  ordered.forEach((period) => {
    res[period.day].push(period);
  });
  // console.log(res);
  return res;
};

export default Schedule;
