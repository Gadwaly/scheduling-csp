import React, { useEffect, useState, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";
//REFACTOR import { Variable, variables as vrs, setNextMethod } from "./csp/csp";
import { Variable } from './csp/models/Variable'
import Schedule from "./components/Schedule";
import { scheduleUpdated } from "./csp/services/VisualizerService";
import { fromEvent, interval, from, Observable, ReplaySubject } from "rxjs";
import { debounce, mergeMap, map } from "rxjs/operators";
import VariablesView from "./components/VariablesView";
//REFACTOR import { setSelectedPrefernces } from "./csp/models";
import allCourses from './csp/allCourses.json'
import { setData } from "./csp/services";
import { Scheduler } from "./csp/Scheduler";
import { CoursesData, PreferencesData } from "./csp/types";
import PreferencesSelector from "./components/PreferencesSelector";

function App() {
  const [variables, setVariables] = useState<Variable[]>();
  const [scheduler, setScheduler] = useState<Scheduler>();
  const [currentVariable, setCurrentVariable] = useState<any>();
  const [cspMoves, setCSPMoves] = useState<any>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [pauseInterval, setPauseInterval] = useState<boolean>(false);
  const [movesSpeed, setMovesSpeed] = useState<number>(1000);
  const [started, setStarted] = useState<boolean>(false);
  const [scheduleUpdated, setScheduleUpdated] = useState<ReplaySubject<any>>()
  const [preferences, setPreferences] = useState<any>()


  // useEffect(() => {
  //   if(!variables){
  //     const schedulerData = setData({table: {CC212: allCourses.CC212, CC273: allCourses.CC273} as CoursesData, preferences: {}});
  //     setVariables(JSON.parse(JSON.stringify(schedulerData.variables)))
  //     const schedulerObject = new Scheduler(schedulerData);
  //     setScheduleUpdated(schedulerObject.scheduleUpdated)
  //     setScheduler(schedulerObject)
  //   }
  // }, [])


  useEffect(() => {
    if(started){
      const schedulerData = setData(preferences);
      setVariables(JSON.parse(JSON.stringify(schedulerData.variables)))
      const schedulerObject = new Scheduler(schedulerData);
      setScheduleUpdated(schedulerObject.scheduleUpdated)
      setScheduler(schedulerObject)
      schedulerObject.schedule()
    }
  }, [started])

  useEffect(() => {
    if(scheduleUpdated){
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
    scheduler.setNextMethod(event.target.value)
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      window.scrollTo(0,document.body.scrollHeight);
    }, 1000)
  }

  const restart = () => {
    const schedulerData = setData({table: {CC212: allCourses.CC212, CC273: allCourses.CC273} as CoursesData, preferences: {}});
    setVariables(JSON.parse(JSON.stringify(schedulerData.variables)))
    const schedulerObject = new Scheduler(schedulerData);
    setScheduleUpdated(schedulerObject.scheduleUpdated)
    setScheduler(schedulerObject)
    setStarted(false);
  }

  const startCSP = () => {
    // scheduler?.schedule();
    setStarted(true);
    scrollToBottom();
  }

  const buildPreferences = (courses, daysOff, earlyLate, minMaxDays, gaps) => {
    const tableArray = courses.map(course => {
      return {[course.code] : allCourses[course.code]}
    })
    const table = Object.assign({}, ...tableArray);
    const preferencesObject = {
      "earlyOrLate": {
        "value": earlyLate[0],
        "order": earlyLate[1]
      },
      "offDays": {
        "value": daysOff[0],
        "order": daysOff[1]
      },
      "gaps": {
        "value": gaps[0],
        "order": gaps[1]
      },
      "minOrMaxDays": {
        "value": minMaxDays[0],
        "order": minMaxDays[1]
      }
    }
    setPreferences({
      table,
      preferences: preferencesObject
    })
    console.log({
      table,
      preferences: preferencesObject
    })
  }

  return (
    <div className="App">
       {!started && 
        <PreferencesSelector buildPreferences={buildPreferences} />
       }
      <div className="actions-bar">
        {!started && (
          <>
          {/* <div className="action"> */}
          {/* <label htmlFor="preferences">Select Preferences:</label> */}

            {/* <select name="preferences" id="preferences" onChange={setPreferences} multiple>
              <option value="minDays">Min Days</option>
              <option value="maxDays">Max Days</option>
              <option value="earlyPeriods">Early Periods</option>
              <option value="latePeriods">Late Periods</option>
              <option value="gaps">Min Gaps</option>
              <option value="gapsPlus">Max Gaps</option>
            </select> */}
          {/* </div> */}
            <div className="action">
              <label htmlFor="speeds">
                Next Variable Heuristic
                <select
                  defaultValue="min-values"
                  onChange={changeNextMethod}
                  name="next_variable_method"
                  id="variable-methods"
                >
                  <option value="min-values">Minimum Possible Values</option>
                  <option value="weights">Weights</option>
                </select>
              </label>
            </div>
            <div className="action">
              <button
                onClick={startCSP}
              >
                Start
              </button>
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
                  restart()
                }}
              >
                Restart
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
