import React, { useEffect, useState,useRef } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Variable, variables as vrs } from "./csp/csp";
import Schedule from "./components/Schedule";
import { scheduleUpdated } from "./csp/service";
import { fromEvent, interval, from, Observable } from "rxjs";
import { debounce, mergeMap, map } from "rxjs/operators";

function App() {
  const [variables, setVariables] = useState<Variable[]>();
  const [currentVariable, setCurrentVariable] = useState<any>();
  const [cspMoves, setCSPMoves] = useState<any>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);

  useEffect(() => {
    console.log(vrs);
    scheduleUpdated.subscribe((newVariables: Variable[]) => {
      cspMoves.push(JSON.parse(JSON.stringify(newVariables)))
    });
  }, []);

  useInterval(() => {
    if (cspMoves[currentMoveIndex]) {
      console.log(cspMoves[currentMoveIndex])
      setVariables(cspMoves[currentMoveIndex].variables);
      setCurrentVariable(cspMoves[currentMoveIndex].currentVariable)
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  }, 1000);


  const logOutput = (val: any) => {
    console.log(val);
  };

  return (
    <div className="App">{variables && <Schedule variables={variables} />}</div>
  );
}




function useInterval(callback: any, delay: any) {
  const savedCallback: any = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default App;
