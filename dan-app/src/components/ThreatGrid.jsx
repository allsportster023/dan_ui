import { Card, Container, Stack} from '@mui/material'
import axios from 'axios';

import React, { useEffect, useState} from 'react'

import { ThreatCard } from './ThreatCard'

const baseUrl = "http://localhost:8080/";

export const ThreatGrid = (props) => {
    const {threats, 
        setThreats,
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
    <Container>
        <Stack direction="row">
        {threats.map((threat) => {
            return <ThreatCard 
            key={threat.id} 
            threat={threat}
            refreshThreatCards={refreshThreatCards}></ThreatCard>
        })}
        </Stack>
    </Container>
  )
}
