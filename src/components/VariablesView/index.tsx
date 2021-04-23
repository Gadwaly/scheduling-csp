import { CourseGroup, Variable } from "../../csp/models";
import "./VariablesView.css";

interface VariablesViewProps {
  variables: Variable[];
  currentVariable: Variable;
}

export default function VariablesView({
  variables,
  currentVariable,
}: VariablesViewProps) {
  //   variables.map((variable) =>
  //     console.log(variable.courseName, variable.assignedValue, variable.domain)
  //   );

  return (
    <>
      {variables &&
        variables.map((variable, index) => {
          const isCurrent =
            currentVariable?.courseName === variable?.courseName;
          return (
            <>
              <h1 className={isCurrent ? "current" : ""} key={index}>
                {variable.courseName}
              </h1>
              {variable.domain.map((group) => {
                if (
                  JSON.stringify(group.periods) ===
                  JSON.stringify(variable?.assignedValue?.periods)
                )
                  return <Periods group={group} isAssigned={true} />;
                return <Periods group={group} />;
              })}
            </>
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
        group.discarded
          ? "periods_container discarded"
          : isAssigned
          ? "periods_container assigned"
          : "periods_container"
      }
    >
      {group.periods.map((period, index) => (
        <div key={index}>{period.toString()}</div>
      ))}
    </div>
  );
}
