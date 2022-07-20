import { Card, Container, Stack} from '@mui/material'

import React, { useEffect, useState} from 'react'

import { ThreatCard } from './ThreatCard'



export const ThreatGrid = ({sams}) => {


  return (
    <Container>
        <Stack direction="row">
        {sams.map((sam) => {
            return <ThreatCard key={sam.id} sam={sam}></ThreatCard>
        })}
        </Stack>
    </Container>
  )
}
