import Period, { Day } from "./Period";
import { Variable } from "../../csp";
import ScheduleRow from "./SceduleRow";

interface ScheduleProps {
  variables: Variable[];
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
    if (variable.assigned_value) {
      const periods = variable.assigned_value;
      periods.forEach((period: number[]) => {
        const day = Math.floor(period[1] / 2),
          from = period[0] - 12 * day,
          to = period[1] - 12 * day;

        schedule.push({
          id: i++,
          day,
          from,
          to,
          course_name: variable.course_name,
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
  return res;
};

export default Schedule;
