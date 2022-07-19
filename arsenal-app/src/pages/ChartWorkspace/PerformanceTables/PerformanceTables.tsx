import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import clsx from 'clsx';
import { groupBy, isNil } from 'lodash-es';
import { useEffect, useState } from 'react';
import { arsenalService } from '../../../services/arsenal-service';
import { Signal, System, Threshold, thresholdHasData } from '../../../services/arsenal-service.model';
import { SignalOption } from '../SignalsPicker';
import { SystemOption } from '../SystemsPicker';

import classes from './PerformanceTables.module.scss';

interface PerformanceTablesProps {
    systems: [SystemOption, System][];
    signals: [SignalOption, Signal][];
    useTestData: boolean;
    showNoDataThresholds: boolean;
    fontSize: number;
}

function getValueColor(value: number): string {
    if (isNil(value) || value === 0) {
        return 'white';
    }
    if (value < 34) {
        return 'rgb(0, 255, 0)';
    }
    if (value < 44) {
        return 'rgb(255, 255, 0)';
    }
    if (value < 54) {
        return 'rgb(255, 192, 0)';
    }
    if (value < 64) {
        return 'rgb(255, 0, 0)';
    }
    if (value < 74) {
        return 'rgb(0, 0, 255)';
    }
    if (value < 84) {
        return 'rgb(102, 51, 0)';
    }
    if (value < 100) {
        return 'rgb(255, 153, 205)';
    }
    return 'rgb(0, 255, 255)';
}

export function PerformanceTables(props: PerformanceTablesProps) {

    const [tableData, setTableData] = useState<[Threshold, Signal, System][]>([]);

    const groupedTableData = Object.entries(groupBy(tableData, (t) => t[0].signal));

    useEffect(() => {
        if (props.systems.length !== 0 && props.signals.length !== 0) {
            setTableData([]);
            arsenalService.getThresholds(props.systems.map((s) => s[0]), props.signals.map((s) => s[0]), props.useTestData, !props.showNoDataThresholds)
                .then((responses) => setTableData(responses.map((t) => [
                    t,
                    props.signals.find((s) => s[1].id === t.signalId)?.[1] as Signal,
                    props.systems.find((s) => s[1].id === t.systemId)?.[1] as System
                ])))
                .catch(console.log);
        } else {
            setTableData([])
        }
    }, [props.systems, props.signals, props.useTestData, props.showNoDataThresholds]);

    const est = ' (est.)';
    const currentDate = new Date();
    const fontSize = `${0.8 * props.fontSize}em`;
    const cellStyle = { fontSize };

    return (
        <>
            {groupedTableData.map(([signalName, thresholds]) => (
                <TableContainer component={Paper} key={thresholds[0][0].signalId} className={classes.performanceTable}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={cellStyle} scope="colgroup">
                                    <div className={classes.verticalColumnContainer}>
                                        <span>{process.env.REACT_APP_CLASSIFICATION_TITLE}</span>
                                        <span>{currentDate.toLocaleDateString()}</span>
                                    </div>
                                </TableCell>
                                <TableCell style={cellStyle} scope="colgroup" colSpan={3} className={classes.signalName}>{signalName}</TableCell>
                                <TableCell style={cellStyle} scope="colgroup" colSpan={2}>Acquisition</TableCell>
                                <TableCell style={cellStyle} scope="colgroup" colSpan={2}>Track</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={cellStyle} scope="col">Classification</TableCell>
                                <TableCell style={cellStyle} scope="col">System</TableCell>
                                <TableCell style={cellStyle} scope="col">Description</TableCell>
                                <TableCell style={cellStyle} scope="col">Configuration</TableCell>
                                <TableCell style={cellStyle} scope="col">Degraded</TableCell>
                                <TableCell style={cellStyle} scope="col">Denied</TableCell>
                                <TableCell style={cellStyle} scope="col">Degraded</TableCell>
                                <TableCell style={cellStyle} scope="col">Denied</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {thresholds.map(([threshold, signal, system]) => (
                                <TableRow key={`${threshold.signalId}:${threshold.systemId}`}>
                                    <TableCell style={cellStyle}>{system.class}</TableCell>
                                    <TableCell style={cellStyle}>{threshold.system}</TableCell>
                                    <TableCell style={cellStyle}>
                                        <div className={classes.verticalColumnContainer}>
                                            <div>{threshold.configData.systemCountry}</div>
                                            <div>{threshold.configData.systemAgency}</div>
                                            <div>{threshold.configData.systemType}</div>
                                            <div>{threshold.configData.systemUse}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell style={cellStyle}>
                                        <div className={clsx(classes.verticalColumnContainer, classes.configDetails)}>
                                            <div><span>Receiver:</span><span>{threshold.configData.receiverName}</span></div>
                                            <div><span>Coupling/IMU:</span><span>{threshold.configData.coupling}/{threshold.configData.imu}</span></div>
                                            <div><span>Ant/AE:</span><span>{threshold.configData.antennaName}/{threshold.configData.antennaElectronics}</span></div>
                                            <div><span>Other&nbsp;AJ:</span><span>{threshold.configData.antiJamInfo}</span></div>
                                            <div><span>Config&nbsp;Class:</span><span>{system.configClass}</span></div>
                                        </div>
                                    </TableCell>
                                    {thresholdHasData(threshold) ? <>
                                        <TableCell style={{...cellStyle, backgroundColor: getValueColor(threshold.degAcq)}}>
                                            <span className={classes.valueText}>{threshold.degAcq ? `${threshold.degAcq} J/S${threshold.degAcqEst ? ' ' + est : ''}` : ''}</span>
                                        </TableCell>
                                        <TableCell style={{...cellStyle, backgroundColor: getValueColor(threshold.noAcq)}}>
                                            <span className={classes.valueText}>{threshold.noAcq ? `${threshold.noAcq} J/S${threshold.noAcqEst ? ' ' + est : ''}` : ''}</span>
                                        </TableCell>
                                        <TableCell style={{...cellStyle, backgroundColor: getValueColor(threshold.degTrk)}}>
                                            <span className={classes.valueText}>{threshold.degTrk ? `${threshold.degTrk} J/S${threshold.degTrkEst ? ' ' + est : ''}` : ''}</span>
                                        </TableCell>
                                        <TableCell style={{...cellStyle, backgroundColor: getValueColor(threshold.noTrk)}}>
                                            <span className={classes.valueText}>{threshold.noTrk ? `${threshold.noTrk} J/S${threshold.noTrkEst ? ' ' + est : ''}` : ''}</span>
                                        </TableCell>
                                    </> : <TableCell style={cellStyle} colSpan={4}>No data to support this function</TableCell>}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ))}
        </>
    );
}
