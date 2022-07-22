import React, { useEffect, useState } from 'react'
import { 
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
 } from '@mui/material'
import axios from 'axios'

const baseUrl = "http://localhost:8080/";

export const ThreatTypeSelect = ({threatType, handleThreatTypeChange}) => {

    const [threatTypesError, setThreatTypesError] = useState(null)
    const [threatTypesLoading, setThreatTypesLoading] = useState(true)
    const [threatTypes, setThreatTypes] = useState([])

    const handleChange = (event) => {
        console.log('event.target.value: ', event.target.value)
        handleThreatTypeChange(event.target.value);
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
      <FormControl 

        fullWidth={true}
        variant="standard" >
        <Select
          labelId="threatType-label"
          id="threatType-id"
          value={threatType}
          label="Threat Type"
          onChange={handleChange}
          disableUnderline
        >
            {!threatTypesError && !threatTypesLoading && threatTypes.map((type)=> {
                return <MenuItem key={type.id} value={type.name}>
                  <Typography 
                    sx={{ fontSize: 14, pl: 1 }} 
                    color="text.secondary"
                    align="left"
                    >{type.name}</Typography>
                </MenuItem>
            })}
        </Select>
    
      </FormControl>
  )
}
