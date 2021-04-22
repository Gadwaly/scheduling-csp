import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { variables } from './csp/csp'

function App() {
  useEffect(() => {
    logOutput(variables)
  }, [])
  const logOutput = (val: any) => {
    console.log(val)
  } 

  return (
    <div className="App">
      Hello World
    </div>
  );
}

export default App;
