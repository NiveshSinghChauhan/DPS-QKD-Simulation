import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SimulationContextProvider } from './context/simulationContext';



// This is the root point of the react application 
// The main "App" component is wrapped with the "SimulationContextProvider"
// which provides its direct or indeirect children component with the simulation data
// via the use of context
ReactDOM.render(
  <SimulationContextProvider>
    <App />
  </SimulationContextProvider>,

  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
