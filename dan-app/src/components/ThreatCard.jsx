import React from 'react'
import { Button, Card, CardActions, CardContent, Typography } from '@mui/material'

export const ThreatCard = ({sam}) => {

  return (
    <Card sx={{ width: 100, height: 140, m: 2 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {sam.name}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {sam.type}
        </Typography>        
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {sam.target}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Change</Button>
      </CardActions>
    </Card>
  )
}
