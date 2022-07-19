import { Checkbox, TextField, Autocomplete } from "@mui/material";
import { useState } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SystemOption } from "./system-option.model";
import { DraggableSystemsArea } from "./DraggableSystemsArea";

import classes from './SystemsPicker.module.scss';



interface SystemsPickerProps {
    allSystems: SystemOption[];
    setSelectedSystems: (systems: SystemOption[]) => void;
    selectedSystems: SystemOption[];
}

export function SystemsPicker(props: SystemsPickerProps) {
    const [inputValue, setInputValue] = useState('');

    return (
        <div className={classes.root}>
            <Autocomplete
                multiple
                disableCloseOnSelect
                className="margin-bottom-half"
                value={props.selectedSystems}
                options={props.allSystems}
                inputValue={inputValue}
                onInputChange={(event, value, reason) => {
                    if (event?.type === 'blur') {
                        setInputValue('');
                    } else if (reason !== 'reset') {
                        setInputValue(value);
                    }
                }}
                getOptionLabel={(option) => option?.systemName || ''}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                onChange={(event, value) => {
                    props.setSelectedSystems(value);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Systems"
                        variant="standard"
                    />
                )}
                renderOption={(optionProps, option, { selected }) => (
                    <li {...optionProps}>
                        <Checkbox
                            checked={selected}
                            className="padding-bottom-none padding-top-none padding-left-none padding-right-min"
                        />
                        {option.systemName}
                    </li>
                )}
            />
            <DndProvider backend={HTML5Backend}>
                <DraggableSystemsArea
                    selectedSystems={props.selectedSystems}
                    setSelectedSystems={props.setSelectedSystems}
                />
            </DndProvider>
        </div>
    );
}