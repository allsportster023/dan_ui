import { Card, Container, Grid, Stack} from '@mui/material'
import axios from 'axios';

import React, { useEffect, useState} from 'react'

import { ThreatCard } from './ThreatCard'

const baseUrl = "http://localhost:8080/";

export const ThreatGrid = (props) => {
    const {threats, 
        setThreats,
        posReps,
        client,
        threatsError,
        setThreatsError,
        threatsLoading,
        setThreatsLoading
        } = props


    async function refreshThreatCards(threatId) {
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
      }

  return (
    <Container sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
        {threats.map((threat) => {
            return (
              <Grid key={"gridId" + threat.id} item xs={3} style={{ maxWidth: 200}}>
                <ThreatCard 
                  posReps={posReps}
                  client={client}
                  key={threat.id} 
                  threat={threat}
                  refreshThreatCards={refreshThreatCards}>
                </ThreatCard>
              </Grid>
            )
        })}
        </Grid>
    </Container>
  )
}
