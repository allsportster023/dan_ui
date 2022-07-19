import { Checkbox, FormControl, FormControlLabel, FormGroup } from '@mui/material';
import { isEqual } from 'lodash-es';

export interface SignalOption {
    id: number;
    signalName: string;
}

interface SignalsPickerProps {
    allSignals: SignalOption[];
    setSelectedSignals: (signals: SignalOption[]) => void;
    selectedSignals: SignalOption[];
}

export function SignalsPicker(props: SignalsPickerProps) {
    const handleCheckedChange = (option: SignalOption, checked: boolean) => {
        const selectedOption = props.selectedSignals.find((s) => isEqual(s, option));
        if (!checked) {
            props.setSelectedSignals(props.selectedSignals.filter((s) => s !== selectedOption))
        } else if (!selectedOption) {
            props.setSelectedSignals([...props.selectedSignals, option])
        }
    }

    return (
        <FormControl component="fieldset">
            <FormGroup>
                {props.allSignals.map((signal) =>
                    <FormControlLabel
                        className='margin-left-none'
                        control={(
                            <Checkbox
                                className="padding-bottom-min padding-top-min padding-left-min padding-right-min"
                                checked={Boolean(props.selectedSignals.find((s) => isEqual(s, signal)))}
                                onChange={(event) => handleCheckedChange(signal, event.target.checked)}
                                name={signal.signalName}
                            />
                        )}
                        label={signal.signalName}
                        key={signal.id}
                    />
                )}
            </FormGroup>
        </FormControl>
    );
}
