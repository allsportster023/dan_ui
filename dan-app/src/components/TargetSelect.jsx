import React, { useEffect, useState } from "react";
import { FormControl, MenuItem, Select, Typography } from "@mui/material";
import CircularIndeterminate from "./CircularIndeterminate";

export const TargetSelect = ({
  target,
  targetLoading,
  handleTargetChange,
  posReps,
}) => {
  // fields in posRep: alt, gnd_spd, hdg, id, lat, lng, name, source, time

  const handleChange = (event) => {
    console.log("event.target.value: ", event.target.value);
    handleTargetChange(event.target.value);
  };
  let menuItems = [];

  menuItems = posReps.map((posRep, id) => {
    return (
      <MenuItem key={id} value={posRep.name}>
        <Typography
          sx={{ fontSize: 14, pl: 1 }}
          color="text.secondary"
          align="left"
        >
          {posRep.name}
        </Typography>
      </MenuItem>
    );
  });
  menuItems = [
    ...menuItems,
    <MenuItem key={-1} value={"None"}>
      <Typography
        sx={{ fontSize: 14, pl: 1 }}
        color="text.secondary"
        align="left"
      >
        None
      </Typography>
    </MenuItem>,
  ];
  console.log("targetLoading: ", targetLoading);

  return (
    <FormControl fullWidth={true} variant="standard">
      {targetLoading ? (
        <CircularIndeterminate />
      ) : (
        <Select
          labelId="target-select-label"
          id="target-select"
          value={target}
          label="Target"
          onChange={handleChange}
          disableUnderline
          // defaultValue=""
        >
          {menuItems}
        </Select>
      )}
    </FormControl>
  );
};
