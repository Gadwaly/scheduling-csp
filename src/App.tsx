import React, { useEffect, useState, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";
//REFACTOR import { Variable, variables as vrs, setNextMethod } from "./csp/csp";
import { Variable } from "./csp/models/Variable";
import Schedule from "./components/Schedule";
import { scheduleUpdated } from "./csp/services/VisualizerService";
import { fromEvent, interval, from, Observable, ReplaySubject } from "rxjs";
import { debounce, mergeMap, map } from "rxjs/operators";
import VariablesView from "./components/VariablesView";
//REFACTOR import { setSelectedPrefernces } from "./csp/models";
import allCourses from "./csp/allCourses.json";
import { setData } from "./csp/services";
import { Scheduler } from "./csp/Scheduler";
import { CoursesData, PreferencesData } from "./csp/types";
import PreferencesSelector from "./components/PreferencesSelector";
import { formatCourseGroups } from "./visualizer_utils";

function App() {
  const [variables, setVariables] = useState<Variable[]>();
  const [scheduler, setScheduler] = useState<Scheduler>();
  const [currentVariable, setCurrentVariable] = useState<any>();
  const [cspMoves, setCSPMoves] = useState<any>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [pauseInterval, setPauseInterval] = useState<boolean>(false);
  const [movesSpeed, setMovesSpeed] = useState<number>(1000);
  const [started, setStarted] = useState<boolean>(false);
  const [scheduleUpdated, setScheduleUpdated] = useState<ReplaySubject<any>>();
  const [preferences, setPreferences] = useState<any>();
  const [nextMethod, setNextMethod] = useState<string>("min-values");
  const [availableCourses, setAvailableCourses] = useState<any>([]);
  const [preferencesExist, setPreferencesExist] = useState<boolean>(true);

  useEffect(() => {
    if (availableCourses.length == 0) {
      setAvailableCourses(formatCourseGroups(allCourses));
    }
  }, []);

  useEffect(() => {
    console.log(availableCourses);
  }, [availableCourses]);

  useEffect(() => {
    if (started) {
      if (!scheduler) {
        const schedulerData = setData(preferences);
        setVariables(JSON.parse(JSON.stringify(schedulerData.variables)));
        const schedulerObject = new Scheduler(schedulerData);
        schedulerObject.setNextMethod(nextMethod)
        setScheduleUpdated(schedulerObject.scheduleUpdated)
        setScheduler(schedulerObject)
        schedulerObject.schedule()
      }else{
        scheduler.schedule()
      }
    }
  }, [started]);

  useEffect(() => {
    if (scheduleUpdated) {
      scheduleUpdated.subscribe((newVariables: Variable[]) => {
        cspMoves.push(JSON.parse(JSON.stringify(newVariables)));
      });
    }
  }, [scheduleUpdated]);

  useInterval(() => {
    if (cspMoves[currentMoveIndex] && !pauseInterval) {
      setVariables(cspMoves[currentMoveIndex].variables);
      setCurrentVariable(cspMoves[currentMoveIndex].currentVariable);
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  }, movesSpeed);

  const togglePauseInterval = () => {
    setPauseInterval(!pauseInterval);
  };

  const changeSpeed = (event: any) => {
    setMovesSpeed(event.target.value * 1);
  };

  const changeNextMethod = (event: any) => {
    setNextMethod(event.target.value);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 1000);
  };

  const restart = () => {
    setStarted(false);
    setScheduler(null)
  }

  const clearCourses = () => {
    setVariables(null);
    setScheduler(null);
    setStarted(false);
    setPreferences(null);
    availableCourses.forEach((course) => {
      course.selectedInstructor = null;
    });
    reloadPreferences();
  };

  const startCSP = () => {
    setStarted(true);
    scrollToBottom();
  };

  const buildPreferences = (
    courses,
    daysOff,
    earlyLate,
    minMaxDays,
    gaps,
    coursesInstructors
  ) => {
    const tableArray = courses.map((course) => {
      return { [course.code]: allCourses[course.code] };
    });
    const table = Object.assign({}, ...tableArray);
    const preferencesObject = {
      ...(earlyLate[0] && {
        earlyOrLate: {
          value: earlyLate[0],
          order: earlyLate[1],
        },
      }),
      ...(minMaxDays[0] && {
        minMaxDays: {
          value: minMaxDays[0],
          order: minMaxDays[1],
        },
      }),
      ...(daysOff[0].length > 0 && {
        daysOff: {
          value: daysOff[0].map((dayOff) => dayOff),
          order: daysOff[1],
        },
      }),
      ...(gaps[0] && {
        gaps: {
          value: gaps[0],
          order: gaps[1],
        },
      }),
      ...(coursesInstructors[0] && {
        courseInstructor: {
          value: coursesInstructors[0],
          order: coursesInstructors[1],
        },
      }),
    };
    setPreferences({
      table,
      preferences: preferencesObject,
    });
    console.log({
      table,
      preferences: preferencesObject,
    });
  };

  const reloadPreferences = () => {
    setPreferencesExist(false);
    setTimeout(() => {
      setPreferencesExist(true);
    }, 500);
  };

  return (
    <div className="App">
      {preferencesExist && (
        <div className={started ? "hidden-preferences" : null}>
          <PreferencesSelector
            availableCourses={availableCourses}
            buildPreferences={buildPreferences}
          />
        </div>
      )}
      <div className="actions-bar">
        {!started && (
          <>
            <div className="action">
              <label htmlFor="speeds">
                Next Variable Heuristic
                <select
                  defaultValue="min-values"
                  onChange={changeNextMethod}
                  value={nextMethod}
                  name="next_variable_method"
                  id="variable-methods"
                >
                  <option value="min-values">Minimum Possible Values</option>
                  <option value="weights">Weights</option>
                </select>
              </label>
            </div>
            <div className="action">
              <button onClick={startCSP}>Start</button>
            </div>
          </>
        )}
        {started && (
          <>
            <div className="action">
              <button onClick={togglePauseInterval}>
                {pauseInterval ? "Resume" : "Pause"}
              </button>
            </div>
            <div className="action">
              <button
                onClick={() => {
                  restart();
                }}
              >
                Restart
              </button>
            </div>
            <div className="action">
              <button
                onClick={() => {
                  clearCourses();
                }}
              >
                Clear Courses
              </button>
            </div>
          </>
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
