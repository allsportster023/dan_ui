import React, { useState } from 'react'
import { 
  Button, 
  Dialog,
  DialogActions,
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  TextField
} from '@mui/material'
import axios from 'axios';

import { TargetSelect } from './TargetSelect'
import { ThreatTypeSelect } from './ThreatTypeSelect'

export const ThreatDialog = (props) => {
  const { open, handleCloseOpenDialog, threat, setOpen } = props
  console.log('myThreat: ', threat)
  const [target, setTarget] = useState(threat.target)
  const [threatType, setThreatType] = useState(threat.threatType)
  const [submitError, setSubmitError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);

const baseUrl = "http://localhost:8080/";


  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const res = await axios.put(baseUrl + "threats/" + threat.id, 
      {
        name: threat.name,
        latitude: threat.latitude,
        longitude: threat.longitude,
        target: target,
        threatType: threatType,
      });
      console.log("res in change target: ", res);

      setSubmitError(false);

      handleCloseOpenDialog();
    } catch (error) {
      setSubmitError(error?.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSetTarget(newTarget) {
    setTarget(newTarget)
  }

  function handleSetThreatType(newThreatType) {
    setThreatType(newThreatType)
  }
  return (
    <div>
    <Dialog open={open} >
      <DialogTitle></DialogTitle>
      <DialogContent>
        <DialogContentText>
          Change the threat's type and/or target.
        </DialogContentText>
        <ThreatTypeSelect threatType={threatType} handleSetThreatType={handleSetThreatType}/>
        <TargetSelect target={target} handleSetTarget={handleSetTarget}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit}>Submit</Button>
        <Button onClick={handleCloseOpenDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  </div>
  )
}
