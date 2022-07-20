import React, { useState } from 'react'
import { Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import { ThreatDialog } from './ThreatDialog'

export const ThreatCard = ({threat, refreshThreatCards}) => {
  const [threatDialogIsOpen, setThreatDialogIsOpen] = useState(false);
    

    // const handleClickOpenDialog = () => {
    //   setOpenDialog(true);
    // };
  
    const handleCloseOpenDialog = () => {
        setThreatDialogIsOpen(false);
        refreshThreatCards();
    };

  return (
    <>
    <Card sx={{ width: 180, height: 140, m: 2 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} align="left" color="text.secondary" gutterBottom>
          Name: {threat.name}
        </Typography>
        <Typography sx={{ fontSize: 14 }} align="left" color="text.secondary" gutterBottom>
          Type: {threat.threatType}
        </Typography>        
        <Typography sx={{ fontSize: 14 }} align="left" color="text.secondary" gutterBottom>
          Target: {threat.target}
        </Typography>
      </CardContent>
      <CardActions style={{ paddingTop: 0}}>
        <Button size="small" onClick={() => setThreatDialogIsOpen(true)}>Edit</Button>
      </CardActions>
    </Card>
    <ThreatDialog open={threatDialogIsOpen}
    handleCloseOpenDialog={handleCloseOpenDialog}
    threat={threat}/>
    </>
  )
}
