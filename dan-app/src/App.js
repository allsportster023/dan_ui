import "./App.css";
import React, { useState } from "react";

import { ThreatGrid } from "./components/ThreatGrid";
import NavBar from "./NavBar";
import Map from "./Map";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { ThemeProvider, createTheme } from "@mui/material";
import baseTheme from "./muiThemes/baseTheme.js";

// const posRepClient = new W3CWebSocket('ws://' + process.env.REACT_APP_API_URL + ':6969');
// const posRepClient = new W3CWebSocket('ws://192.168.1.183:6969');
// const threatClient = new W3CWebSocket('ws://' + process.env.REACT_APP_API_URL + ':7060');
// const threatClient = new W3CWebSocket('ws://192.168.1.183:7060');
const posRepClient = new W3CWebSocket("ws://localhost:6969");
const threatClient = new W3CWebSocket("ws://localhost:7060");

function App() {
  const [theme, setTheme] = useState(baseTheme);
  const [threats, setThreats] = useState(null);
  const [posReps, setPosReps] = useState(null);
  const [focusedThreatId, setFocusedThreatId] = useState(null);

  posRepClient.onopen = () => {
    console.log("WebSocket Client Connected");
  };

  //Message will be an array of position reports for each aircraft
  posRepClient.onmessage = (message) => {
    if (message !== null) {
      // console.log("message.data from posRepClient: ", JSON.parse(message.data));
      setPosReps(JSON.parse(message.data));
    }
    posRepClient.send("Hi");
  };

  threatClient.onopen = () => {
    console.log("WebSocket ThreatClient Connected");
  };
  // threatClient.onerror = (error) => {
  //   console.log("error event: ", error)
  // }

  //Message will be an array of threats
  threatClient.onmessage = (message) => {
    if (message !== null) {
      setThreats(JSON.parse(message.data));
    }
    threatClient.send("Hello");
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <NavBar />
        {posReps && threats && (
          <Map
            threats={threats}
            posReps={posReps}
            focusedThreatId={focusedThreatId}
          />
        )}
        {posReps && threats && (
          <ThreatGrid
            threats={threats}
            posReps={posReps}
            threatClient={threatClient}
            setThreats={setThreats}
            setFocusedThreatId={setFocusedThreatId}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
