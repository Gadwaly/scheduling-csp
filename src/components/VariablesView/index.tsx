import React from "react";
import { CourseGroup, Variable } from "../../csp/models";
import { Day } from "../Schedule/Period";
import "./VariablesView.css";

interface VariablesViewProps {
  variables: Variable[];
  currentVariable: Variable;
}

export default function VariablesView({
  variables,
  currentVariable,
}: VariablesViewProps) {
  return (
    <>
      {variables &&
        variables.map((variable, variable_index) => {
          const isCurrent =
            currentVariable?.courseName === variable?.courseName;
          return (
            <React.Fragment key={variable_index}>
              <h1 style={{marginTop: "7px", marginBottom: "3px"}} className={isCurrent ? "current" : ""}>
                {variable.courseName}
              </h1>
              {variable.domain.map((group, group_index) => {
                if (
                  JSON.stringify(group.periods) ===
                  JSON.stringify(variable?.assignedValue?.periods)
                )
                  return <Periods key={group_index} group={group} isAssigned={true} />;
                return <Periods key={group_index} group={group} />;
              })}
            </React.Fragment>
          );
        })}
    </>
  );
}

function Periods({
  group,
  isAssigned,
}: {
  group: CourseGroup;
  isAssigned?: boolean;
}) {
  return (
    <div
      className={
        group.discardingCounter !== 0
          ? "periods_container discarded"
          : isAssigned
          ? "periods_container assigned"
          : "periods_container"
      }
    >
      {group.periods.map((period, index) => {
        const day = Math.floor(period[1] / 12),
          from = period[0] - 12 * day + 1,
          to = period[1] - 12 * day + 1;
        return (
          <div key={index}>
            {`${Day[day]} : ` + (from === to ? `${from}` : `[${from} - ${to}]`)}
          </div>
        );
      })}
      <div>{Math.round(group.cost * 100) / 100}</div>
    </div>
  );
}
