import './App.css';
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { ThreatGrid } from './components/ThreatGrid'
import NavBar from "./NavBar";
import Map from "./Map";
import {  ThemeProvider,
  createTheme} from '@mui/material'

import baseTheme from "./muiThemes/baseTheme.js";


const baseUrl = "http://localhost:8080/";

function App() {

  const [theme, setTheme] = useState(baseTheme);


  const [threatsError, setThreatsError] = useState(null)
  const [threatsLoading, setThreatsLoading] = useState(true)
  const [threats, setThreats] = useState([])
  const [posRepsError, setPosRepError] = useState(null)
  const [posRepsLoading, setPosRepLoading] = useState(true)
  const [posReps, setPosReps] = useState([])

  useEffect(() => {
    axios
      .get(baseUrl + "threats")
      .then((response) => {
        console.log("threats: ", response.data)

        setThreats(response.data);
      })
      .catch((err) => {
        console.log("there was an error getting threats", err);
        setThreatsError(err);
      })
      .finally(() => {
        setThreatsLoading(false);
      });
  }, []);

  useEffect(() => {
    axios
      .get(baseUrl + "pos_reps")
      .then((response) => {
        console.log("pos_reps: ", response.data)
        setPosReps(response.data);
      })
      .catch((err) => {
        console.log("there was an error getting pos_reps", err);
        setPosRepError(err);
      })
      .finally(() => {
        setPosRepLoading(false);
      });
  }, []);

  return (
    <ThemeProvider theme={theme}>
    
    <div className="App">
      <NavBar />
      <Map/>
      {!threatsError && !threatsLoading && 
        <ThreatGrid 
          threats={threats}
          setThreats={setThreats}
          threatsError={threatsError}
          setThreatsError={setThreatsError}
          threatsLoading={threatsLoading}
          setThreatsLoading={setThreatsLoading}/>
        }
    </div>
    </ThemeProvider>
  );
}

export default App;
