import { Variable } from "../../csp/models";
import "./VariablesView.css";

interface VariablesViewProps {
  variables: Variable[];
}

export default function VariablesView({ variables }: VariablesViewProps) {
  variables.map((variable) =>
    console.log(variable.courseName, variable.assignedValue, variable.domain)
  );

  return (
    <>
      {variables.map((variable, index) => {
        return (
          <>
            <h1 key={index}>{variable.courseName}</h1>
            {variable.domain.map((group) => {
              if (
                JSON.stringify(group.periods) ===
                JSON.stringify(variable.assignedValue.periods)
              )
                return <Periods periods={group.periods} isAssigned={true} />;
              return <Periods periods={group.periods} />;
            })}
          </>
        );
      })}
    </>
  );
}

function Periods({
  periods,
  isAssigned,
}: {
  periods: number[][];
  isAssigned?: boolean;
}) {
  return (
    <div
      className={
        isAssigned ? "periods_container assigned" : "periods_container"
      }
    >
      {periods.map((period, index) => (
        <div key={index}>{period.toString()}</div>
      ))}
    </div>
  );
}
