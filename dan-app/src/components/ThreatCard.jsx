import React, { useState } from 'react'
import {Button, Card, CardActions, CardContent, Stack, Typography} from '@mui/material'
import axios from 'axios'

import { TargetSelect } from './TargetSelect'
import { ThreatTypeSelect } from './ThreatTypeSelect'
import { Box } from '@mui/system'


export const ThreatCard = ({threat, refreshThreatCards, posReps, threatClient, setFocusedThreatId}) => {

  const [target, setTarget] = useState(threat.cur_target)
  const [threatType, setThreatType] = useState(threat.cur_threat)
  const [isFocused, setIsFocused] = useState(false)

    function handleTargetChange(newTarget) {
      // setTarget(newTarget)
      // if(newTarget === 'None') {
      //   newTarget = ''
      // }
      
      const updatedThreat =
      {
        sam_id: threat.sam_id,
        lat: threat.lat,
        long: threat.long,
        cur_target: newTarget,
        cur_threat: threat.cur_threat,
        status: threat.status,
        az: threat.az,
        el: threat.el,
        range_to_target: threat.range_to_target,
        gnd_speed: threat.gnd_speed,
        heading: threat.heading,
      }
      console.log('updatedThreat: ', updatedThreat)
      threatClient.send(JSON.stringify(updatedThreat))
    }
  
    function handleThreatTypeChange(newThreatType) {
      // setThreatType(newThreatType)
      const updatedThreat =
      {
        sam_id: threat.sam_id,
        lat: threat.lat,
        long: threat.long,
        cur_target: threat.cur_target,
        cur_threat: newThreatType,
        status: threat.status,
        az: threat.az,
        el: threat.el,
        range_to_target: threat.range_to_target,
        gnd_speed: threat.gnd_speed,
        heading: threat.heading,
      }
      threatClient.send(JSON.stringify(updatedThreat))
    }

  function handleMouseOut() {
    setFocusedThreatId(null)
    setIsFocused(false)
  }

  function handleMouseOver(threat) {
    setFocusedThreatId(threat.sam_id)
    setIsFocused(true)
  }

  return (
    <>
    <Card sx={{ width: 200, height: 140, m: 2}}
          style={{boxShadow: !isFocused ? "" : "4px 10px 7px -7px rgba(0,0,0,0.2),2px 5px 5px 2px rgba(0,0,0,0.14),2px 5px 7px 2px rgba(0,0,0,0.12)"}}
          onMouseOver={(e) => handleMouseOver(threat)}
          onMouseOut={(e) => handleMouseOut()}>
      <CardContent sx={{backgroundColor: '#fafcff'}}>
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
          Name: {threat.sam_id}
        </Typography>
        <Stack direction="row">
        <Typography sx={{ fontSize: 14}} align="left" color="text.secondary" gutterBottom>
          Type: 
        </Typography>     
        <ThreatTypeSelect threatType={threat.cur_threat} handleThreatTypeChange={handleThreatTypeChange}/>
        </Stack>   
        <Stack direction="row">
        <Typography sx={{ fontSize: 14 }} align="left" color="text.secondary" gutterBottom>
          Target: 
        </Typography>
        <TargetSelect posReps={posReps} target={threat.cur_target} handleTargetChange={handleTargetChange}/>
        </Stack>
        <Typography sx={{ fontSize: 14 }} align="left" color="text.secondary" gutterBottom>
          Range to Target: {threat.cur_target === "None" ? '-' 
          : threat.cur_target ? parseInt(threat.range_to_target) : '-'}
          {/* Range to Target: {threat.range_to_target} */}
        </Typography>
      </CardContent>
    </Card>
    </>
  )
}
