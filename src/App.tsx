import React, { useEffect, useState, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Variable, variables as vrs, setNextMethod } from "./csp/csp";
import Schedule from "./components/Schedule";
import { scheduleUpdated, startCSP } from "./csp/service";
import { fromEvent, interval, from, Observable } from "rxjs";
import { debounce, mergeMap, map } from "rxjs/operators";
import VariablesView from "./components/VariablesView";

function App() {
  const [variables, setVariables] = useState<Variable[]>();
  const [currentVariable, setCurrentVariable] = useState<any>();
  const [cspMoves, setCSPMoves] = useState<any>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [pauseInterval, setPauseInterval] = useState<boolean>(false);
  const [movesSpeed, setMovesSpeed] = useState<number>(1000);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    console.log(vrs);
    scheduleUpdated.subscribe((newVariables: Variable[]) => {
      cspMoves.push(JSON.parse(JSON.stringify(newVariables)));
    });
  }, []);

  useInterval(() => {
    if (cspMoves[currentMoveIndex] && !pauseInterval) {
      console.log(cspMoves[currentMoveIndex]);
      setVariables(cspMoves[currentMoveIndex].variables);
      setCurrentVariable(cspMoves[currentMoveIndex].currentVariable);
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  }, movesSpeed);

  const logOutput = (val: any) => {
    console.log(val);
  };

  const togglePauseInterval = () => {
    setPauseInterval(!pauseInterval);
  };

  const changeSpeed = (event: any) => {
    setMovesSpeed(event.target.value * 1);
  };

  const changeNextMethod = (event: any) => {
    setNextMethod(event.target.value)
  }

  return (
    <div className="App">
      <div className="actions-bar">
        {!started && (
          <>
            <div className="action">
              <label htmlFor="speeds">
                Next Variable Method
                <select
                  defaultValue="min-values"
                  onChange={changeNextMethod}
                  name="next_variable_method"
                  id="variable-methods"
                >
                  <option value="min-values">Min Values</option>
                  <option value="weights">Weights</option>
                </select>
              </label>
            </div>
            <div className="action">
              <button
                onClick={() => {
                  startCSP.next();
                  setStarted(true);
                }}
              >
                Start
              </button>
            </div>
          </>
        )}
        {started && (
          <div className="action">
            <button onClick={togglePauseInterval}>
              {pauseInterval ? "Resume" : "Pause"}
            </button>
          </div>
        )}
        <div className="action">
          <label htmlFor="speeds">
            Speed
            <select
              defaultValue="1000"
              onChange={changeSpeed}
              name="speeds"
              id="speeds"
            >
              <option value="100">Fast</option>
              <option value="1000">Normal</option>
              <option value="2000">Slow</option>
            </select>
          </label>
        </div>
      </div>
      {variables && (
        <div className="schedule-variables-container">
          <div className="variables-view">
            <VariablesView
              variables={variables}
              currentVariable={currentVariable}
            />
          </div>
          <div className="schedule">
            <Schedule variables={variables} />
          </div>
        </div>
      )}
    </div>
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
