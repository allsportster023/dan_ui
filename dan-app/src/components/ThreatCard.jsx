import React, { useState } from 'react'
import { Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import axios from 'axios'
import { ThreatDialog } from './ThreatDialog'

import { TargetSelect } from './TargetSelect'
import { ThreatTypeSelect } from './ThreatTypeSelect'
import { Box } from '@mui/system'


export const ThreatCard = ({threat, refreshThreatCards, posReps, client}) => {

  const [target, setTarget] = useState(threat.target)
  const [threatType, setThreatType] = useState(threat.threatType)
    

    function handleTargetChange(newTarget) {
      setTarget(newTarget)

      const updatedThreat =
      {
        name: threat.name,
        latitude: threat.latitude,
        longitude: threat.longitude,
        target: newTarget,
        threatType: threatType,
        status: threat.status,
        az: threat.az,
        el: threat.el
      }
      client.send(JSON.stringify(updatedThreat))
    }
  
    function handleThreatTypeChange(newThreatType) {
      setThreatType(newThreatType)
      const updatedThreat = {
        someField: "someString"
      }
      client.send(JSON.stringify(updatedThreat))
    }


  return (
    <>
    <Card sx={{ width: "fit-content", height: 140, m: 2 }}>
      <CardContent >
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
              }}>
            </Box>
        </Stack>
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
        <TargetSelect posReps={posReps} target={target} handleTargetChange={handleTargetChange}/>
        </Stack>
      </CardContent>
    </Card>
    </>
  )
}
