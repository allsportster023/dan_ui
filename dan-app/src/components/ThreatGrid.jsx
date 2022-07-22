import { Card, Container, Grid, Stack} from '@mui/material'
import axios from 'axios';

import React, { useEffect, useState} from 'react'

import { ThreatCard } from './ThreatCard'

export const ThreatGrid = (props) => {
    const {threats, 
        setThreats,
        posReps,
        threatClient,
        threatsError,
        setThreatsError,
        threatsLoading,
        setThreatsLoading,
        setFocusedThreatId
        } = props



  return (
    <Container sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
        {threats.map((threat) => {
            return (
              <Grid key={"gridId" + threat.sam_id} item xs={3} style={{ width: 200}}>
                <ThreatCard 
                  posReps={posReps}
                  threatClient={threatClient}
                  key={threat.sam_id}
                  setFocusedThreatId={setFocusedThreatId}
                  threat={threat}>
                </ThreatCard>
              </Grid>
            )
        })}
        </Grid>
    </Container>
  )
}
