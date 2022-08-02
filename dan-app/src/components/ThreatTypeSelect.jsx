import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

import CircularIndeterminate from "./CircularIndeterminate";
import { threatTypesData } from "../data/db";
//Manually importing the data for ease of use during hackathon
// import threatTypesData from '../data/db.json'
const baseUrl = "http://localhost:8080/";

export const ThreatTypeSelect = ({ cur_threat, handleThreatTypeChange }) => {
  console.log("threat in select: ", cur_threat);
  const [threatTypesError, setThreatTypesError] = useState(null);
  const [threatTypesLoading, setThreatTypesLoading] = useState(true);
  const [threatTypes, setThreatTypes] = useState(null);
  const [threatTypeLoading, setThreatTypeLoading] = useState(false);

  const handleChange = (event) => {
    setThreatTypeLoading(true);
    console.log("event.target.value: ", event.target.value);
    handleThreatTypeChange(event.target.value);
  };

  useEffect(() => {
    // when we change type, we display spinner until threat object is changed by socket
    setThreatTypeLoading(false);
  }, [cur_threat]);

  //TODO - we will want to add this to the Python backend

  useEffect(() => {
    setThreatTypes(threatTypesData);
    setThreatTypesLoading(false);
    setThreatTypesError(null);
    // //axios
    //   .get(baseUrl + "threatTypes")
    //   .then((response) => {
    //     console.log("threatTypes in select component: ", response.data);
    //     setThreatTypes(response.data);
    //   })
    //   .catch((err) => {
    //     console.log("there was an error getting threatTypes", err);
    //     setThreatTypesError(err);
    //   })
    //   .finally(() => {
    //     setThreatTypesLoading(false);
    //   });
  }, [] );

  return (
    <FormControl fullWidth={true} variant="standard">
      {threatTypesLoading || threatTypeLoading ? (
        <CircularIndeterminate />
      ) : threatTypesError ? (
        "Error"
      ) : (
        <Select
          labelId="threatType-label"
          id="threatType-id"
          value={cur_threat}
          label="Threat Type"
          onChange={handleChange}
          disableUnderline
        >
          {threatTypes.map((type) => {
            return (
              <MenuItem key={type.id} value={type.name}>
                {/* {type.name} */}
                <Typography
                  sx={{ fontSize: 14, pl: 1 }}
                  color="text.secondary"
                  align="left"
                >
                  {type.name}
                </Typography>
              </MenuItem>
            );
          })}
        </Select>
      )}
    </FormControl>
  );
};
