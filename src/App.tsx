import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { variables } from "./csp/csp";
import Schedule from "./components/Schedule";

function App() {
  useEffect(() => {
    logOutput(variables);
  }, []);
  const logOutput = (val: any) => {
    console.log(val);
  };

  return (
    <div className="App">
      <Schedule variables={variables} />
    </div>
  );
}

export default App;
