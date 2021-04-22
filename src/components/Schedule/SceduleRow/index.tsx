import React from "react";
import Period from "../Period";
import EmptyCells from "../EmptyCells";
import styles from "../style.module.css";

interface ScheduleRowProps {
  schedule: Period[];
  day: string;
  periodsCount?: number;
}

const ScheduleRow = ({
  schedule,
  day,
  periodsCount = 12,
}: ScheduleRowProps) => {
  return (
    <tr>
      <th>{day}</th>

      {schedule.length === 0
        ? EmptyCells(periodsCount)
        : schedule.map((period, i) => {
            return (
              <React.Fragment key={period.id}>
                {EmptyCells(i === 0 ? period.from - 1 : 0)}
                <td
                  colSpan={period.to - period.from + 1}
                  className={styles[period.type || 0]}
                >
                  {period.course_name}
                </td>
                {EmptyCells(
                  schedule[i + 1]
                    ? schedule[i + 1].from - period.to - 1
                    : periodsCount - period.to
                )}
              </React.Fragment>
            );
          })}
    </tr>
  );
};

export default ScheduleRow;