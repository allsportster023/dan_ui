import {
    FormControl,
    FormControlLabel,
    FormLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Switch,
    TextField,
    Slider
} from '@mui/material';
import clsx from 'clsx';
import { convertDbwToWatts, convertWattsToDbw } from '../../../utils';
import { ChartWorkspaceView } from '../ChartWorkspace';
import { SignalOption, SignalsPicker } from '../SignalsPicker';
import { SystemOption, SystemsPicker } from '../SystemsPicker';

import classes from './ChartWorkspaceSettings.module.scss';

const minChartHeight = 100;
const maxChartHeight = 500;
const minBackgroundOpacity = 0.25;
const maxBackgroundOpacity = 1;
const backgroundOpacityStep = 0.01;
const minFontSize = 1;
const maxFontSize = 1.5;
const fontSizeStep = 0.01;
const aspectRatios = [
    { value: 0, description: 'Dynamic' },
    { value: 11/8.5, description: 'Letter' },
    { value: 16/9, description: '16:9' },
    { value: 4/3, description: '4:3' }
].map((r) => ({ ...r, value: Number(r.value.toFixed(6)) }));

export interface ChartWorkspaceSettingsProps {
    view: ChartWorkspaceView;
    title: string;
    setTitle: (val: string) => void;
    allSystems: SystemOption[];
    allSignals: SignalOption[];
    selectedSystems: SystemOption[];
    setSelectedSystems: (val: SystemOption[]) => void;
    selectedSignals: SignalOption[];
    setSelectedSignals: (val: SignalOption[]) => void;
    groupBySystem: boolean;
    setGroupBySystem: (val: boolean) => void;
    showJammerRanges: boolean;
    setShowJammerRanges: (val: boolean) => void;
    allJammerRangeUnits: string[];
    jammerRangeUnits: string;
    setJammerRangeUnits: (val: string) => void;
    jammerPowerDbw: number;
    setJammerPowerDbw: (val: number) => void;
    jammerPowerWatts: number;
    setJammerPowerWatts: (val: number) => void;
    aspectRatio: number;
    setAspectRatio: (val: number) => void;
    chartHeight: number;
    setChartHeight: (val: number) => void;
    showBarLabels: boolean;
    setShowBarLabels: (val: boolean) => void;
    showAxisBar: boolean;
    setShowAxisBar: (val: boolean) => void;
    showLegend: boolean;
    setShowLegend: (val: boolean) => void;
    useOrigColors: boolean;
    setUseOrigColors: (val: boolean) => void;
    useTestData: boolean;
    setUseTestData: (val: boolean) => void;
    showNoDataThresholds: boolean;
    setShowNoDataThresholds: (val: boolean) => void;
    truncateToData: boolean;
    setTruncateToData: (val: boolean) => void;
    backgroundOpacity: number;
    setBackgroundOpacity: (val: number) => void;
    fontSize: number;
    setFontSize: (val: number) => void;
}

export function ChartWorkspaceSettings(props: ChartWorkspaceSettingsProps) {
    const isRibbonChartView = props.view === ChartWorkspaceView.RibbonChart;

    return (
        <div className={clsx(classes.settingsPanelBody, 'bg-light', 'border-light', 'padding-2x')}>
            <h2 className="margin-bottom-1x">Chart Settings</h2>
            <TextField
                size="small"
                variant="standard"
                label="Chart Title"
                value={props.title}
                onChange={(event) => props.setTitle(event.target.value)}
            />
            <div className={clsx(classes.threeColumns, 'margin-top-1x')}>
                <div className={classes.settingsColumn}>
                    <h3 className="margin-bottom-half">Systems</h3>
                    <div className={clsx(classes.scrollingSelection, 'padding-right-1x')}>
                        <SystemsPicker
                            allSystems={props.allSystems}
                            setSelectedSystems={props.setSelectedSystems}
                            selectedSystems={props.selectedSystems}
                        />
                    </div>
                </div>
                <div className={classes.settingsColumn}>
                    <h3 className="margin-bottom-half">GNSS Signals</h3>
                    <div className={clsx(classes.scrollingSelection, 'padding-right-1x')}>
                        <SignalsPicker
                            allSignals={props.allSignals}
                            setSelectedSignals={props.setSelectedSignals}
                            selectedSignals={props.selectedSignals}
                        />
                    </div>
                </div>
                <div className={clsx(classes.settingsColumn, classes.spaceBetweenLabels)}>
                    <h3 className="margin-bottom-1x">Other Options</h3>
                    <div className={classes.twoColumns}>
                        {isRibbonChartView ? (
                            <div className={clsx(classes.settingsColumn, classes.groupBySettingsColumn)}>
                                <FormControl component="fieldset" className={clsx(classes.borderBottomLight)}>
                                    <FormLabel component="legend">Group By</FormLabel>
                                    <RadioGroup
                                        value={props.groupBySystem ? 'true' : 'false'}
                                        name="groupBySystem"
                                        onChange={(event) => {
                                            const newVal = event.target.value === 'true';
                                            props.setGroupBySystem(newVal);

                                            // Jammer ranges can only be shown when grouped by signal
                                            if (newVal) {
                                                props.setShowJammerRanges(false);
                                            }
                                        }}
                                    >
                                        <FormControlLabel value="false" control={<Radio size="small" />} label="Signal" labelPlacement="start" />
                                        <FormControlLabel className="margin-top-neg-half" value="true" control={<Radio size="small" />} label="System" labelPlacement="start" />
                                    </RadioGroup>
                                </FormControl>
                                {!props.groupBySystem ? (
                                    <>
                                        <FormControlLabel
                                            className="margin-top-min"
                                            label="Show Jammer Ranges"
                                            labelPlacement="start"
                                            control={(
                                                <Switch
                                                    size="small"
                                                    checked={props.showJammerRanges}
                                                    onChange={(event) => props.setShowJammerRanges(event.target.checked)}
                                                />
                                            )}
                                        />
                                        {props.showJammerRanges ? (
                                            <>
                                                <FormControlLabel
                                                    className="margin-top-min"
                                                    label="Jammer Power (dBW)"
                                                    labelPlacement="start"
                                                    control={(
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            className={classes.smallInput}
                                                            variant="standard"
                                                            inputProps={{ step: 0.1, min: 0 }}
                                                            value={props.jammerPowerDbw}
                                                            onChange={(event) => {
                                                                const value = Number(event.target.value);
                                                                props.setJammerPowerDbw(value);
                                                                props.setJammerPowerWatts(convertDbwToWatts(value));
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <FormControlLabel
                                                    className="margin-top-min"
                                                    label="Jammer Power (W)"
                                                    labelPlacement="start"
                                                    control={(
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            className={classes.smallInput}
                                                            variant="standard"
                                                            inputProps={{ step: 1, min: 0 }}
                                                            value={props.jammerPowerWatts}
                                                            onChange={(event) => {
                                                                const value = Number(event.target.value);
                                                                props.setJammerPowerDbw(convertWattsToDbw(value));
                                                                props.setJammerPowerWatts(value);
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <FormControlLabel
                                                    className="margin-top-min"
                                                    label="Jammer Range Units"
                                                    labelPlacement="start"
                                                    control={(
                                                        <Select
                                                            size="small"
                                                            className={classes.smallInput}
                                                            variant="standard"
                                                            value={props.jammerRangeUnits}
                                                            onChange={(event) => props.setJammerRangeUnits(event.target.value)}
                                                        >
                                                            {props.allJammerRangeUnits.map((unit) => <MenuItem key={unit} value={unit}>{unit}</MenuItem>)}
                                                        </Select>
                                                    )}
                                                />
                                            </>
                                        ) : null}
                                    </>
                                ) : null}
                            </div>
                        ) : null}
                        <div className={classes.settingsColumn}>
                            {isRibbonChartView ? (
                                <>
                                    <FormControlLabel
                                        className="margin-bottom-min"
                                        label="Aspect Ratio"
                                        labelPlacement="start"
                                        control={(
                                            <Select
                                                size="small"
                                                className={classes.mediumInput}
                                                variant="standard"
                                                value={props.aspectRatio}
                                                onChange={(event) => props.setAspectRatio(event.target.value as number)}
                                            >
                                                {aspectRatios.map((aspectRatio) => <MenuItem key={aspectRatio.description} value={aspectRatio.value}>{aspectRatio.description}</MenuItem>)}
                                            </Select>
                                        )}
                                    />
                                    {!props.aspectRatio ? (
                                        <FormControl component="fieldset">
                                            <FormLabel className="text-white" component="legend">Bar Height</FormLabel>
                                            <Slider
                                                size="small"
                                                min={minChartHeight}
                                                max={maxChartHeight}
                                                value={props.chartHeight}
                                                onChange={(event, newValue) => props.setChartHeight(newValue as number)}
                                                valueLabelDisplay="off"
                                            />
                                        </FormControl>
                                    ) : null}
                                    <FormControl component="fieldset" className={classes.borderBottomLight}>
                                        <FormLabel className="text-white" component="legend">Background Opacity</FormLabel>
                                        <Slider
                                            size="small"
                                            min={minBackgroundOpacity}
                                            max={maxBackgroundOpacity}
                                            step={backgroundOpacityStep}
                                            value={props.backgroundOpacity}
                                            onChange={(event, newValue) => props.setBackgroundOpacity(newValue as number)}
                                            valueLabelDisplay="off"
                                        />
                                    </FormControl>
                                </>
                            ) : null}
                            <FormControl component="fieldset" className={classes.borderBottomLight}>
                                <FormLabel className="text-white" component="legend">Font Size</FormLabel>
                                <Slider
                                    size="small"
                                    min={minFontSize}
                                    max={maxFontSize}
                                    step={fontSizeStep}
                                    value={props.fontSize}
                                    onChange={(event, newValue) => props.setFontSize(newValue as number)}
                                    valueLabelDisplay="off"
                                />
                            </FormControl>
                            {isRibbonChartView ? (
                                <>
                                    <FormControlLabel
                                        className="margin-top-min"
                                        label="Show Labels"
                                        labelPlacement="start"
                                        control={(
                                            <Switch
                                                size="small"
                                                checked={props.showBarLabels}
                                                onChange={(event) => props.setShowBarLabels(event.target.checked)}
                                            />
                                        )}
                                    />
                                    <FormControlLabel
                                        className="margin-top-min"
                                        label="Show Axis"
                                        labelPlacement="start"
                                        control={(
                                            <Switch
                                                size="small"
                                                checked={props.showAxisBar}
                                                onChange={(event) => props.setShowAxisBar(event.target.checked)}
                                            />
                                        )}
                                    />
                                    <FormControlLabel
                                        className="margin-top-min"
                                        label="Show Legend"
                                        labelPlacement="start"
                                        control={(
                                            <Switch
                                                size="small"
                                                checked={props.showLegend}
                                                onChange={(event) => props.setShowLegend(event.target.checked)}
                                            />
                                        )}
                                    />
                                    <FormControlLabel
                                        className="margin-top-min"
                                        label="Fit Chart to Data"
                                        labelPlacement="start"
                                        control={(
                                            <Switch
                                                size="small"
                                                checked={props.truncateToData}
                                                onChange={(event) => props.setTruncateToData(event.target.checked)}
                                            />
                                        )}
                                    />
                                    <FormControlLabel
                                        className="margin-top-min"
                                        label="Use Original Bar Colors"
                                        labelPlacement="start"
                                        control={(
                                            <Switch
                                                size="small"
                                                checked={props.useOrigColors}
                                                onChange={(event) => props.setUseOrigColors(event.target.checked)}
                                            />
                                        )}
                                    />
                                </>
                            ) : null}
                            <FormControlLabel
                                className="margin-top-min"
                                label="Use Test Data"
                                labelPlacement="start"
                                control={(
                                    <Switch
                                        size="small"
                                        checked={props.useTestData}
                                        onChange={(event) => props.setUseTestData(event.target.checked)}
                                    />
                                )}
                            />
                            <FormControlLabel
                                className="margin-top-min"
                                label="Show Items With No Data"
                                labelPlacement="start"
                                control={(
                                    <Switch
                                        size="small"
                                        checked={props.showNoDataThresholds}
                                        onChange={(event) => props.setShowNoDataThresholds(event.target.checked)}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}