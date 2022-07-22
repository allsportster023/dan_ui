import './App.css';
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Split from "react-split";
import SplitPane from 'react-split-pane'

import { ThreatGrid } from './components/ThreatGrid'
import NavBar from "./NavBar";
import Map from "./Map";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import {  ThemeProvider, createTheme} from '@mui/material'
import baseTheme from "./muiThemes/baseTheme.js";

const posRepClient = new W3CWebSocket('ws://192.168.1.183:6969');
const threatClient = new W3CWebSocket('ws://192.168.1.183:7060');
// const client = new W3CWebSocket('ws://localhost:6969');
const baseUrl = "http://localhost:8080/";

function App() {

  const [theme, setTheme] = useState(baseTheme);
  const [threats, setThreats] = useState(null)
  const [posReps, setPosReps] = useState(null)

  posRepClient.onopen = () => {
    console.log('WebSocket Client Connected');
  };

  //Message will be an array of position reports for each aircraft
  posRepClient.onmessage = (message) => {

    if(message !== null){
      console.log('message.data from posRepClient: ', JSON.parse(message.data))
      setPosReps(JSON.parse(message.data))
    }
    posRepClient.send("Hi")
  };

  threatClient.onopen = () => {
    console.log('WebSocket ThreatClient Connected');
  };
  // threatClient.onerror = (error) => {
  //   console.log("error event: ", error)
  // }

  //Message will be an array of threats
  threatClient.onmessage = (message) => {

    if(message !== null){
      const test = JSON.parse(message.data)
      setThreats(JSON.parse(message.data))
    }
    threatClient.send("Hello")
  };


  return (
    <ThemeProvider theme={theme}>
    <div className="App">
      <NavBar />
      {/* <SplitPane className =".Resizer" split="horizontal" minSize={100} maxSize={600} defaultSize={500}> */}
        {posReps && threats && 
        <Map 
          threats={threats} 
          posReps={posReps}
          // style={{minHeight: 100, maxHeight: 300, height: '100%'}}
        />}
        {posReps && threats && 
        <ThreatGrid
          threats={threats}
          posReps={posReps}
          threatClient={threatClient}
          setThreats={setThreats}
          />
        }
        {/* </SplitPane> */}
    </div>
    </ThemeProvider>
  );
}

export default App;
