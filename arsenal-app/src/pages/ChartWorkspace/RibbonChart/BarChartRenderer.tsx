import clsx from "clsx";
import { sortBy } from "lodash";
import {
    Bar, BarChart, Cell, Label,
    LabelList, Legend, ResponsiveContainer,
    Tooltip, XAxis,
    YAxis
} from "recharts";
import { Threshold, thresholdHasData } from "../../../services/arsenal-service.model";
import { newValueColors, originalValueColors, ValueField } from "../colors";

import classes from './BarChartRenderer.module.scss';

const legendFields: ValueField[] = [
    ValueField.DegradedAcquisition,
    ValueField.NoAcquisition,
    ValueField.DegradedTrack,
    ValueField.NoTrack
];

function isValueEstimated(threshold: Threshold, key: ValueField) {
    if (key === ValueField.DegradedAcquisition) {
        return threshold.degAcqEst;
    }
    if (key === ValueField.NoAcquisition) {
        return threshold.noAcqEst;
    }
    if (key === ValueField.DegradedTrack) {
        return threshold.degTrkEst;
    }
    if (key === ValueField.NoTrack) {
        return threshold.noTrkEst;
    }
    return false;
}

function getBackground(opacity: number) {
    return `linear-gradient(
        90deg,
        rgba(0,0,0,0) 0%,
        rgba(0,255,0,${opacity}) 20%,
        rgba(255,255,0,${opacity}) 33%,
        rgba(246,0,0,${opacity}) 51%,
        rgba(0,0,255,${opacity}) 56%,
        rgba(124,50,50,${opacity}) 67%,
        rgba(233,0,255,${opacity}) 80%,
        rgba(0,255,255,${opacity}) 100%
    )`;
}

function getLabelColor(useOrigColors: boolean, estimated: boolean) {
    if (estimated) {
        return useOrigColors ? "#ff0000" : "#a11236";
    }
    return "#000000";
}

const mapKeyToReadable = (key?: ValueField) => {
    // These fields indicate the values when "degraded"/"no" begin,
    // but the graphs are depicting values up until those points
    if (key === ValueField.DegradedAcquisition) {
        return "Clean Acquire";
    }
    if (key === ValueField.NoAcquisition) {
        return "Degraded Acquire";
    }
    if (key === ValueField.DegradedTrack) {
        return "Clean Track";
    }
    if (key === ValueField.NoTrack) {
        return "Degraded Track";
    }
    return '';
}

interface BarChart2Props {
    label: string;
    thresholds: Threshold[];
    height: number;
    isFirst: boolean;
    isLast: boolean;
    useOrigColors: boolean;
    showLabels: boolean;
    showAxis: boolean;
    showLegend: boolean;
    groupBySystem: boolean;
    jammerRangeUnits?: string;
    maxValue?: number;
    backgroundOpacity: number;
    fontSize: number;
}

interface BarChartValue {
    field: ValueField;
    value: number;
    diff: number;
    estimated: boolean;
}

export const getJammerRangesHeight = (fontSize: number) => fontSize * 15;
export const getXAxisHeight = (fontSize: number) => fontSize * 30;
export const getLegendHeight = (fontSize: number) => fontSize * 85;
const sideMarginWidth = 50;
const yAxisWidth = 150;
const absoluteMaxChartValue = 114;

export const BarChartRenderer = ({
    label,
    thresholds,
    height,
    isFirst,
    isLast,
    useOrigColors,
    showLabels,
    showAxis,
    showLegend,
    groupBySystem,
    jammerRangeUnits,
    maxValue,
    backgroundOpacity,
    fontSize
}: BarChart2Props) => {
    // INFO: Normally, Clean Acquire === Degraded Acquire
    // INFO: Normally, Clean Track   === Degraded Track
    const transformedThresholds = thresholds.map((t) => {
        // We don't want to stack the raw values, but rather the differences as we build the stack.
        // Get the values into a sorted array, and then map raw values to differences from the previous values.
        const rawValues: Array<Omit<BarChartValue, 'diff'>> = [
            { field: ValueField.DegradedAcquisition, value: t[ValueField.DegradedAcquisition], estimated: isValueEstimated(t, ValueField.DegradedAcquisition) },
            { field: ValueField.NoAcquisition, value: t[ValueField.NoAcquisition], estimated: isValueEstimated(t, ValueField.NoAcquisition) },
            { field: ValueField.DegradedTrack, value: t[ValueField.DegradedTrack], estimated: isValueEstimated(t, ValueField.DegradedTrack) },
            { field: ValueField.NoTrack, value: t[ValueField.NoTrack], estimated: isValueEstimated(t, ValueField.NoTrack) }
        ];
        const sortedValues = sortBy(rawValues, 'value');
        let previousValue: number;
        const barValues: BarChartValue[] = sortedValues.map((v) => {
            const diff = previousValue === undefined ? v.value : v.value - previousValue;
            previousValue = v.value;
            return { ...v, diff };
        });

        return { ...t, barValues };
    });

    const barColors = useOrigColors ? originalValueColors : newValueColors;
    const jammerRanges = thresholds?.[0]?.jammerRanges;
    const showJammerRanges = Boolean(jammerRanges?.length);

    const renderTooltip = (e: any) => {
        const threshold: Threshold = e.payload?.[0]?.payload;
        const est = ' (est.)';
        if (e.active && threshold) {
            // Conditionally render the no values if they are not equal to the degraded
            return (
                <div className={clsx(classes.tooltip, 'bg-white')}>
                    <p><b>{(groupBySystem ? threshold.system : threshold.signal) + ': ' + e.label}</b></p>
                    {thresholdHasData(threshold) ? <>
                        <div className={classes.legendLineItem}>
                            <div className={clsx(classes.legendBox, 'margin-right-min')} style={{backgroundColor: barColors[ValueField.DegradedAcquisition]}}/>
                            <div>{(`${mapKeyToReadable(ValueField.DegradedAcquisition)}: ${threshold[ValueField.DegradedAcquisition]} J/S ${isValueEstimated(threshold, ValueField.DegradedAcquisition) ? est : ''}`)}</div>
                        </div>
                        {threshold[ValueField.NoAcquisition] !== threshold[ValueField.DegradedAcquisition] ? (
                            <div className={classes.legendLineItem}>
                                <div className={clsx(classes.legendBox, 'margin-right-min')} style={{backgroundColor: barColors[ValueField.NoAcquisition]}}/>
                                <div>{(`${mapKeyToReadable(ValueField.NoAcquisition)}: ${threshold[ValueField.NoAcquisition]} J/S ${isValueEstimated(threshold, ValueField.NoAcquisition) ? est : ''}`)}</div>
                            </div>
                        ) : null}
                        <div className={classes.legendLineItem}>
                            <div className={clsx(classes.legendBox, 'margin-right-min')} style={{backgroundColor: barColors[ValueField.DegradedTrack]}}/>
                            <div>{(`${mapKeyToReadable(ValueField.DegradedTrack)}: ${threshold[ValueField.DegradedTrack]} J/S ${isValueEstimated(threshold, ValueField.DegradedTrack) ? est : ''}`)}</div>
                        </div>
                        {threshold[ValueField.NoTrack] !== threshold[ValueField.DegradedTrack] ? (
                            <div className={classes.legendLineItem}>
                                <div className={clsx(classes.legendBox, 'margin-right-min')} style={{backgroundColor: barColors[ValueField.NoTrack]}}/>
                                <div>{(`${mapKeyToReadable(ValueField.NoTrack)}: ${threshold[ValueField.NoTrack]} J/S ${isValueEstimated(threshold, ValueField.NoTrack) ? est : ''}`)}</div>
                            </div>
                        ) : null}
                    </> : null}
                </div>);
        } else {
            return '';
        }
    }

    const renderLabel = (props: any) => {
        const { content, value, ...rest }: { value: BarChartValue, content: any } = props;

        // No label if the bar isn't going to show
        if (!value.diff) {
            return null;
        }
        return (
            <Label
                {...rest}
                fill={getLabelColor(useOrigColors, value.estimated)}
                textDecoration={value.estimated ? "underline" : undefined}
                fontWeight="bold"
                filter="drop-shadow(0 0 7px rgba(255, 255, 255, .30))"
            >{value.value}</Label>
        );
    };

    const renderLegend = () => {
        return (
            <div className={classes.legendContainer} style={{height: `${getLegendHeight(fontSize)}px`}}>
                <div className={clsx(classes.legend, 'bg-white', 'margin-1x', 'padding-1x', 'border-light')}>
                    <ul className={classes.legendLine}>
                        {legendFields.map((field, idx) => (
                            <li key={field} className={clsx(classes.legendLineItem, { 'margin-right-2x': idx < legendFields.length - 1 })}>
                                <div className={clsx(classes.legendBox, 'margin-right-min')} style={{backgroundColor: barColors[field]}}/>
                                <div className={classes.noWrap}>{mapKeyToReadable(field)}</div>
                            </li>
                        ))}
                    </ul>
                    <ul className={clsx(classes.legendLine, 'margin-top-min')}>
                        <li
                            style={{ color: getLabelColor(useOrigColors, true), textDecoration: 'underline', fontWeight: 'bold' }}
                            className={clsx(classes.noWrap, 'margin-right-2x')}
                        >Estimated Value</li>
                        <li
                            style={{ color: getLabelColor(useOrigColors, false), fontWeight: 'bold' }}
                            className={classes.noWrap}
                        >Known Value</li>
                    </ul>
                </div>
            </div>
        );
    }

    const renderXAxisTick = (props: any) => {
        const { x, y, fill, payload, index } = props;
        const jammerRange = jammerRanges?.[index];
        let strJammerRange = '';

        // Round the ranges to JNWC-specified values
        if (typeof jammerRange === 'number' && (jammerRangeUnits !== 'ft' && jammerRangeUnits !== 'm')) {
            if (jammerRange > 0 && jammerRange < 10) {
                strJammerRange = jammerRange.toFixed(2)
            } else if (jammerRange >= 10 && jammerRange < 100) {
                strJammerRange = jammerRange.toFixed(1)
            } else {
                strJammerRange = jammerRange.toFixed(0)
            }
        } else if (typeof jammerRange === 'number') {
            strJammerRange = jammerRange.toFixed(0)
        }

        const yActual = showJammerRanges ? y - getJammerRangesHeight(fontSize) : y;

        return (
            <>
                <g transform={`translate(${x},${yActual})`}>
                    <text x={0} y={0} dy={-2} orientation="top" textAnchor="middle" fill={fill}>
                        {payload.value}
                    </text>
                </g>
                {typeof jammerRange === 'number' ? (
                    <g transform={`translate(${x},${yActual})`}>
                        <text x={0} y={0} dy={26} orientation="top" textAnchor="middle" fill={fill}>
                            {`${strJammerRange} ${jammerRangeUnits || ''}`}
                        </text>
                    </g>
                ) : null}
            </>
        );
    }

    // Calculate the gradient based on the max value; this does not take into account the right margin, so maybe off slightly
    const chartExtent = Math.min((maxValue || absoluteMaxChartValue), absoluteMaxChartValue);
    const backgroundOffset = sideMarginWidth + yAxisWidth;
    const backgroundStyle = {
        backgroundImage: getBackground(backgroundOpacity),
        backgroundSize: `calc(${100 * (1 / (chartExtent / absoluteMaxChartValue))}% - ${backgroundOffset}px) auto`,
        backgroundPosition: `${backgroundOffset}px 0`,
        backgroundRepeat: 'no-repeat',
        filter: useOrigColors ? '' : 'brightness(125%)'
    };

    // Setting ResponsiveContainer's width to 100% causes it to not shrink properly:
    // https://github.com/recharts/recharts/issues/172
    return (
        <div style={backgroundStyle} className={classes.outerContainer}>
            <ResponsiveContainer height={height} width={"99.9%"}>
                <BarChart
                    layout="vertical"
                    data={transformedThresholds}
                    margin={{left: sideMarginWidth, right: sideMarginWidth}}
                >
                    <XAxis
                        hide={(!isFirst && !showJammerRanges) || !showAxis}
                        height={showJammerRanges ? getXAxisHeight(fontSize) + getJammerRangesHeight(fontSize) : getXAxisHeight(fontSize)}
                        type="number"
                        orientation={"top"}
                        tick={renderXAxisTick}
                        tickLine={showJammerRanges ? { transform: `translate(0,${0 - getJammerRangesHeight(fontSize)})` } : {}}
                        stroke="currentColor"
                        strokeWidth={2}
                        axisLine={false}
                        domain={[0, chartExtent]}
                        ticks={[24, 34, 44, 54, 64, 74, 84, 94, 104, 114].filter((t) => maxValue ? t <= maxValue : true)}
                    />
                    <YAxis
                        type="category"
                        dataKey={groupBySystem ? "signal" : "system"}
                        stroke="currentColor"
                        width={yAxisWidth}
                        label={{
                            value: label,
                            angle: -90,
                            position: 'left',
                            offset: 30,
                            fontSize: "1.1em",
                            fill: 'currentColor',
                            style: {textAnchor: 'middle'}
                        }}
                    />
                    <YAxis
                        yAxisId={'nodata'}
                        type="category"
                        dataKey={(entry) => thresholdHasData(entry) ? '' : 'No data to support this function'}
                        stroke="currentColor"
                        width={200}
                        axisLine={false}
                        tickLine={false}
                        mirror={true}
                        tickMargin={20}
                    />
                    <Tooltip cursor={{fill: 'rgba(255, 255, 255, .25)'}} content={renderTooltip}/>
                    {showLegend && isLast ? (
                        <Legend content={renderLegend}/>
                    ) : null}
                    {Array.from(Array(4).keys()).map((index) => (
                        <Bar key={`bar-${index}`} dataKey={(entry) => entry.barValues[index].diff} stackId="a" maxBarSize={375}>
                            {transformedThresholds.map((entry) => <Cell key={entry.barValues[index].field} fill={barColors[entry.barValues[index].field]} />)}
                            {showLabels ? (
                                <LabelList
                                    dataKey={(entry: any) => entry.barValues[index]}
                                    position="insideRight"
                                    content={renderLabel}
                                />
                            ) : null}
                        </Bar>
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
