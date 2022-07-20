import React, { useState } from 'react'
import { Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import axios from 'axios'
import { ThreatDialog } from './ThreatDialog'

import { TargetSelect } from './TargetSelect'
import { ThreatTypeSelect } from './ThreatTypeSelect'
import { Box } from '@mui/system'

const baseUrl = "http://localhost:8080/";


export const ThreatCard = ({threat, refreshThreatCards}) => {
  // const [threatDialogIsOpen, setThreatDialogIsOpen] = useState(false);

  const [target, setTarget] = useState(threat.target)
  const [threatType, setThreatType] = useState(threat.threatType)
  const [submitError, setSubmitError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
    

    // const handleClickOpenDialog = () => {
    //   setOpenDialog(true);
    // };

    async function handleTargetChange(newTarget) {
      setIsSubmitting(true);
    try {
      const res = await axios.put(baseUrl + "threats/" + threat.id, 
      {
        name: threat.name,
        latitude: threat.latitude,
        longitude: threat.longitude,
        target: newTarget,
        threatType: threatType,
        status: threat.status,
        az: threat.az,
        el: threat.el

      });
      console.log("res in change target: ", res);

      setSubmitError(false);
      setTarget(newTarget)
      refreshThreatCards();
    } catch (error) {
      setSubmitError(error?.message);
    } finally {
      setIsSubmitting(false);
    }
    }
  
    // const handleCloseOpenDialog = () => {
    //     setThreatDialogIsOpen(false);
    //     refreshThreatCards();
    // };

    async function handleThreatTypeChange(newThreatType) {
      setIsSubmitting(true);
    try {
      const res = await axios.put(baseUrl + "threats/" + threat.id, 
      {
        name: threat.name,
        latitude: threat.latitude,
        longitude: threat.longitude,
        target: target,
        threatType: newThreatType,
        status: threat.status,
        az: threat.az,
        el: threat.el

      });
      console.log("res in change target: ", res);

      setSubmitError(false);
      setThreatType(newThreatType)
      refreshThreatCards();
    } catch (error) {
      setSubmitError(error?.message);
    } finally {
      setIsSubmitting(false);
    }
    }

    // async function handleSelectChange() {
    //   setIsSubmitting(true);
    // try {
    //   const res = await axios.put(baseUrl + "threats/" + threat.id, 
    //   {
    //     name: threat.name,
    //     latitude: threat.latitude,
    //     longitude: threat.longitude,
    //     target: target,
    //     threatType: threatType,
    //     status: threat.status
    //   });
    //   console.log("res in change target: ", res);

    //   setSubmitError(false);
    //   setTarget()
    //   refreshThreatCards();
    // } catch (error) {
    //   setSubmitError(error?.message);
    // } finally {
    //   setIsSubmitting(false);
    // }
    // }


  return (
    <>
    <Card sx={{ width: 240, height: 140, m: 2 }}>
      <CardContent>
        <Stack direction="row" style={{justifyContent: "flex-end"}}>
          <Box 
            style={{
              alignSelf: 'flex-end',
              height: 20,
              width: 20,
              backgroundColor: (threat.status === 'not ready' ? '#9ea0a3'
                : threat.status === 'moving' ? '#e3e84a'
                : '#3ca836'),
              borderRadius: 50 
              }}></Box></Stack>
        <Typography sx={{ fontSize: 14 }} align="left" color="text.secondary" gutterBottom>
          Name: {threat.name}
        </Typography>
<Stack direction="row">
        <Typography sx={{ fontSize: 14}} align="left" color="text.secondary" gutterBottom>
          Type: 

        </Typography>     
        <ThreatTypeSelect threatType={threatType} handleThreatTypeChange={handleThreatTypeChange}/>
        </Stack>   
        <Stack direction="row">
        <Typography sx={{ fontSize: 14 }} align="left" color="text.secondary" gutterBottom>
          Target: 
        </Typography>
        <TargetSelect target={target} handleTargetChange={handleTargetChange}/>

        </Stack>
      </CardContent>
      {/* <CardActions style={{ paddingTop: 0}}>
        <Button size="small" onClick={() => setThreatDialogIsOpen(true)}>Edit</Button>
      </CardActions> */}
    </Card>
    {/* <ThreatDialog open={threatDialogIsOpen}
    handleCloseOpenDialog={handleCloseOpenDialog}
    threat={threat}/> */}
    </>
  )
}
