import './App.css';
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { ThreatGrid } from './components/ThreatGrid'
import NavBar from "./NavBar";
import Map from "./Map";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import {  ThemeProvider, createTheme} from '@mui/material'
import baseTheme from "./muiThemes/baseTheme.js";

const client = new W3CWebSocket('ws://localhost:6969');
const baseUrl = "http://localhost:8080/";

function App() {

  const [theme, setTheme] = useState(baseTheme);
  const [threatsError, setThreatsError] = useState(null)
  const [threatsLoading, setThreatsLoading] = useState(true)
  const [threats, setThreats] = useState([])
  const [posRepsError, setPosRepError] = useState(null)
  const [posRepsLoading, setPosRepLoading] = useState(true)
  const [posReps, setPosReps] = useState(null)

  client.onopen = () => {
    console.log('WebSocket Client Connected');
  };

  //Message will be an array of position reports for each aircraft
  client.onmessage = (message) => {

    if(message.data.lat !== null){
      setPosReps([JSON.parse(message.data)])
    }

    client.send("Hi")
  };

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

  return (
    <ThemeProvider theme={theme}>
    <div className="App">
      <NavBar />
          {!threatsError && !threatsLoading && <Map threats={threats} posReps={posReps}/>}
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
