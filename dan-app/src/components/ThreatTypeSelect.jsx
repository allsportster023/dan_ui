import React, { useEffect, useState } from 'react'
import { 
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
 } from '@mui/material'
import axios from 'axios'

const baseUrl = "http://localhost:8080/";

export const ThreatTypeSelect = ({threatType, handleSetThreatType}) => {

    const [threatTypesError, setThreatTypesError] = useState(null)
    const [threatTypesLoading, setThreatTypesLoading] = useState(true)
    const [threatTypes, setThreatTypes] = useState([])

    const handleChange = (event) => {
        console.log('event.target.value: ', event.target.value)
        handleSetThreatType(event.target.value);
      };

    useEffect(() => {
        axios
          .get(baseUrl + "threatTypes")
          .then((response) => {
            console.log("threatTypes in select component: ", response.data)
            setThreatTypes(response.data);
          })
          .catch((err) => {
            console.log("there was an error getting threatTypes", err);
            setThreatTypesError(err);
          })
          .finally(() => {
            setThreatTypesLoading(false);
          });
      }, []);






  return (
    <Box sx={{ mt: 4, minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="threatType-label">Threat Type</InputLabel>
        <Select
          labelId="threatType-label"
          id="threatType-id"
          value={threatType}
          label="Threat Type"
          onChange={handleChange}
        >
            {!threatTypesError && !threatTypesLoading && threatTypes.map((type)=> {
                return <MenuItem key={type.id} value={type.name}>{type.name}</MenuItem>
            })}
        </Select>
      </FormControl>
    </Box>
  )
}
