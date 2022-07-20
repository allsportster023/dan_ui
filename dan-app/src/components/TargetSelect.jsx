import React, { useEffect, useState } from 'react'
import { 
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography
 } from '@mui/material'
import axios from 'axios'

const baseUrl = "http://localhost:8080/";

export const TargetSelect = ({target, handleTargetChange}) => {

    const [posRepsError, setPosRepsError] = useState(null)
    const [posRepsLoading, setPosRepsLoading] = useState(true)
    const [posReps, setPosReps] = useState([])

    const handleChange = (event) => {
        console.log('event.target.value: ', event.target.value)
        handleTargetChange(event.target.value);
      };

    useEffect(() => {
        axios
          .get(baseUrl + "pos_reps")
          .then((response) => {
            console.log("pos_reps in select component: ", response.data)
            setPosReps(response.data);
          })
          .catch((err) => {
            console.log("there was an error getting pos_reps", err);
            setPosRepsError(err);
          })
          .finally(() => {
            setPosRepsLoading(false);
          });
      }, []);

  return (
    // <Box sx={{ mt: 4, minWidth: 120 }}>
      <FormControl 
        // style={{width: 140}} 
        fullWidth="true"
        variant="standard">
        {/* <InputLabel id="target-select-label">Target</InputLabel> */}
        <Select
          labelId="target-select-label"
          id="target-select"
          value={target}
          label="Target"
          onChange={handleChange}
          disableUnderline
        >
            {!posRepsError && !posRepsLoading && posReps.map((posRep)=> {
                return <MenuItem key={posRep.id} value={posRep.name}>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary">
                    {posRep.name}
                    </Typography>
                    </MenuItem>
            })}
        </Select>
      </FormControl>
    // </Box>
  )
}
