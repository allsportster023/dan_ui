import { groupBy } from 'lodash-es';
import { useEffect, useState } from 'react';
import { arsenalService } from "../../../services/arsenal-service";
import { Threshold, thresholdMaxData } from "../../../services/arsenal-service.model";
import { SignalOption } from "../SignalsPicker";
import { SystemOption } from "../SystemsPicker";
import { BarChartRenderer, getJammerRangesHeight, getLegendHeight, getXAxisHeight } from "./BarChartRenderer";

import classes from './RibbonChart.module.scss';

const titleHeight = 46;

interface RibbonChartComponentProps {
    systems: SystemOption[];
    signals: SignalOption[];
    jammerConfig?: {
        jammerPower: number;
        jammerRangeUnits: string;
    },
    groupBySystem: boolean;
    useTestData: boolean;
    useOrigColors: boolean;
    showLabels: boolean;
    showAxis: boolean;
    showLegend: boolean;
    chartHeight: number;
    chartWidth: number;
    showNoDataThresholds: boolean;
    truncateToData: boolean;
    backgroundOpacity: number;
    aspectRatio: number;
    fontSize: number;
}

export function RibbonChart(props: RibbonChartComponentProps) {

    const [barData, setBarData] = useState<Threshold[]>([]);

    const primaryGroupBarData = Object.entries(groupBy(barData, props.groupBySystem ? 'system' : 'signal'));

    useEffect(() => {
        if (props.systems.length !== 0 && props.signals.length !== 0) {
            setBarData([]);
            arsenalService.getThresholds(props.systems, props.signals, props.useTestData, !props.showNoDataThresholds, props.jammerConfig)
                .then((responses) => setBarData(responses))
                .catch(console.log);
        } else {
            setBarData([])
        }
    }, [props.systems, props.signals, props.useTestData, props.showNoDataThresholds, props.jammerConfig]);

    function getTotalBarChartHeight(thresholdsGroup: Threshold[], thresholdsGroupIndex: number, commonChartHeight: number) {
        const jammerRanges = thresholdsGroup?.[0]?.jammerRanges;
        const showJammerRanges = Boolean(jammerRanges?.length);
        const isFirst = thresholdsGroupIndex === 0;
        const isLast = thresholdsGroupIndex === primaryGroupBarData.length - 1;
        let height = commonChartHeight;

        // If the X Axis is enabled, it is shown only for the first grouping,
        // unless there are jammer ranges to display, which are different for each group.
        if (props.showAxis) {
            if (isFirst || showJammerRanges) {
                height += getXAxisHeight(props.fontSize);
            }
            if (showJammerRanges) {
                height += getJammerRangesHeight(props.fontSize);
            }
        }
        if (isLast && props.showLegend) {
            height += getLegendHeight(props.fontSize);
        }
        return height;
    }

    const maxValue = props.truncateToData ? Math.max(...barData.map(thresholdMaxData)) : undefined;

    // If fitting to an aspect ratio, try to calculate the height based on the width.
    // Otherwise use the user-specified height.
    let chartHeight = props.chartHeight;
    if (props.aspectRatio && props.chartWidth) {
        const desiredTotalHeight = props.chartWidth / props.aspectRatio;
        const extraHeight = titleHeight + primaryGroupBarData
            .map(([, thresholds], index) => getTotalBarChartHeight(thresholds, index, 0))
            .reduce((a, b) => a + b, 0);
        let calculatedChartHeight = (desiredTotalHeight - extraHeight) / primaryGroupBarData.length;
        if (calculatedChartHeight > 0) {
            chartHeight = calculatedChartHeight;
        }
    }

    return (
        <>
            {primaryGroupBarData.map(([label, thresholds], index) => {
                const height = getTotalBarChartHeight(thresholds, index, chartHeight);
                const isFirst = index === 0;
                const isLast = index === primaryGroupBarData.length - 1;

                return (
                    <div key={index} style={{height: `${height}px`, width: '100%'}} className={classes.barChartContainer}>
                        <BarChartRenderer
                            label={label}
                            thresholds={thresholds}
                            height={height}
                            isFirst={isFirst}
                            isLast={isLast}
                            useOrigColors={props.useOrigColors}
                            showLabels={props.showLabels}
                            showAxis={props.showAxis}
                            showLegend={props.showLegend}
                            groupBySystem={props.groupBySystem}
                            jammerRangeUnits={props.jammerConfig?.jammerRangeUnits}
                            maxValue={maxValue}
                            backgroundOpacity={props.backgroundOpacity}
                            fontSize={props.fontSize}
                        />
                    </div>
                );
            })}
        </>
    );
}