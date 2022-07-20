import './App.css';
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { ThreatGrid } from './components/ThreatGrid'

const baseUrl = "http://localhost:8080/";


function App() {

  const [samsError, setSamError] = useState(null)
  const [samsLoading, setSamLoading] = useState(true)
  const [sams, setSams] = useState([])
  const [posRepsError, setPosRepError] = useState(null)
  const [posRepsLoading, setPosRepLoading] = useState(true)
  const [posReps, setPosReps] = useState([])

  useEffect(() => {
    axios
      .get(baseUrl + "sams")
      .then((response) => {
        console.log("sams: ", sams)

        setSams(response.data);
      })
      .catch((err) => {
        console.log("there was an error getting sams", err);
        setSamError(err);
      })
      .finally(() => {
        setSamLoading(false);
      });
  }, []);

  useEffect(() => {
    axios
      .get(baseUrl + "pos_reps")
      .then((response) => {
        console.log("pos_reps: ", posReps)
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
    <div className="App">
      {!samsError && !samsLoading && <ThreatGrid sams={sams}/>}
      </div>
  );
}

export default App;
