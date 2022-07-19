import {
    IconButton,
    Menu,
    MenuItem,
    ToggleButton,
    Tooltip,
    ListItemIcon,
    ListItemText,
    ToggleButtonGroup
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import ImageIcon from '@mui/icons-material/Image';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import TableChartIcon from '@mui/icons-material/TableChart';
import clsx from 'clsx';
import { saveAs } from 'file-saver';
import { toBlob } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { isEqual } from 'lodash-es';
import { useState, useEffect, useRef } from 'react';
import { PerformanceTables } from './PerformanceTables';
import { RibbonChart } from './RibbonChart';
import { SignalOption } from './SignalsPicker';
import { SystemOption } from './SystemsPicker';
import { convertDbwToWatts, usePermalink, useElementDimensions } from '../../utils';
import { arsenalService } from '../../services/arsenal-service';
import { ChartWorkspaceSettings } from './ChartWorkspaceSettings';
import { Signal, System } from '../../services/arsenal-service.model';

import classes from './ChartWorkspace.module.scss';
import { ChartWorkspaceSettingsProps } from './ChartWorkspaceSettings/ChartWorkspaceSettings';

export enum ChartWorkspaceView {
    RibbonChart = 'RibbonChart',
    PerformanceTables = 'PerformanceTables'
}

function viewToRootUrl(view: ChartWorkspaceView): string {
    if (view === ChartWorkspaceView.PerformanceTables) {
        return '/tables';
    }
    return '/charts';
}

function viewToDefaultTitle(view: ChartWorkspaceView): string {
    if (view === ChartWorkspaceView.PerformanceTables) {
        return 'Performance Table Generator';
    }
    return 'Ribbon Chart Generator';
}

interface ChartSettings {
    title: string;
    selectedSystems: SystemOption[];
    selectedSignals: SignalOption[];
    useOrigColors: boolean;
    showBarLabels: boolean;
    showAxisBar: boolean;
    showLegend: boolean;
    showJammerRanges: boolean;
    useTestData: boolean;
    groupBySystem: boolean;
    aspectRatio: number;
    chartHeight: number;
    jammerPower: number;
    jammerRangeUnits: string;
    showNoDataThresholds: boolean;
    truncateToData: boolean;
    backgroundOpacity: number;
    fontSize: number;
}

const allJammerRangeUnits = ['nm', 'mi', 'km', 'm', 'ft'];
const defaultFileName = 'chart';
const defaultState: ChartSettings = {
    title: '',
    selectedSystems: [],
    selectedSignals: [],
    useOrigColors: false,
    showBarLabels: true,
    showAxisBar: true,
    showLegend: true,
    showJammerRanges: false,
    useTestData: true,
    groupBySystem: false,
    aspectRatio: 0,
    chartHeight: 400,
    jammerPower: 0,
    jammerRangeUnits: allJammerRangeUnits[0],
    showNoDataThresholds: true,
    truncateToData: false,
    backgroundOpacity: 0.5,
    fontSize: 1.1
}
const filterFromExportClass = 'filter-from-export';
const copySupported = typeof navigator?.clipboard?.write === 'function' && typeof ClipboardItem === 'function';

function getImageSize(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = function(this: any) {
            resolve({ width: this.width, height: this.height });
        }
        image.onerror = (err) => reject(err);
        image.src = url;
    });
}

function exportToPngBlob(rootNode: HTMLElement, classToAdd?: string): Promise<Blob | null> {
    if (classToAdd) {
        rootNode.classList.add(classToAdd);
    }
    return toBlob(
        rootNode,
        { filter: (node) => !node.classList?.contains(filterFromExportClass) }
    ).then((blob) => {
        if (classToAdd) {
            rootNode.classList.remove(classToAdd);
        }
        return blob;
    });
}

async function exportToPdfBlob(rootNode: HTMLElement): Promise<Blob | null> {
    const pngBlob = await exportToPngBlob(rootNode, classes.exportBlackText);
    if (!pngBlob) {
        return null;
    }
    const pngBlobUrl = URL.createObjectURL(pngBlob);
    const originalImageSize = await getImageSize(pngBlobUrl);
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        hotfixes: ['px_scaling'],
    });
    const pageSize = {
        width: doc.internal.pageSize.getWidth(),
        height: doc.internal.pageSize.getHeight(),
    }
    const scalingFactor = Math.min(pageSize.width / originalImageSize.width, pageSize.height / originalImageSize.height);
    const renderWidth = originalImageSize.width * scalingFactor;
    const renderHeight = originalImageSize.height * scalingFactor;
    const renderOffsetLeft = (pageSize.width - renderWidth) / 2;
    const renderOffsetTop = (pageSize.height - renderHeight) / 2;
    doc.addImage(pngBlobUrl, renderOffsetLeft, renderOffsetTop, renderWidth, renderHeight);
    return doc.output('blob');
}

export function ChartWorkspace({ defaultView }: { defaultView: ChartWorkspaceView }) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Put the default view into state
    const [view, setView] = useState(defaultView);

    // Update the current view if defaultView changes
    useEffect(() => {
        setView(defaultView);
    }, [defaultView]);

    // Get permalink hook
    const [startSettingsState, isDefaultState, onSettingsStateUpdate] = usePermalink(() => viewToRootUrl(view), defaultState);

    // Because these are pulled from API, they need to be part of state
    const [allSystems, setAllSystems] = useState<System[]>([]);
    const [allSignals, setAllSignals] = useState<Signal[]>([]);

    // Dynamically determine chart width
    const chartsContainerRef = useRef<HTMLDivElement>(null);
    const chartWidth = useElementDimensions(chartsContainerRef).width;

    // Things the user changes which cause re-renders
    const [showSettings, setShowSettings] = useState(isDefaultState);
    const [exportMenuAnchorElement, setExportMenuAnchorElement] = useState<Element | null>(null);
    const [title, setTitle] = useState(startSettingsState.title);
    const [selectedSystems, setSelectedSystems] = useState(startSettingsState.selectedSystems || []);
    const [selectedSignals, setSelectedSignals] = useState(startSettingsState.selectedSignals || []);
    const [useOrigColors, setUseOrigColors] = useState(startSettingsState.useOrigColors);
    const [showBarLabels, setShowBarLabels] = useState(startSettingsState.showBarLabels);
    const [showAxisBar, setShowAxisBar] = useState(startSettingsState.showAxisBar);
    const [showLegend, setShowLegend] = useState(startSettingsState.showLegend);
    const [showJammerRanges, setShowJammerRanges] = useState(startSettingsState.showJammerRanges);
    const [useTestData, setUseTestData] = useState(startSettingsState.useTestData);
    const [groupBySystem, setGroupBySystem] = useState(startSettingsState.groupBySystem);
    const [aspectRatio, setAspectRatio] = useState(startSettingsState.aspectRatio);
    const [chartHeight, setChartHeight] = useState(startSettingsState.chartHeight);
    const [jammerPowerDbw, setJammerPowerDbw] = useState(startSettingsState.jammerPower);
    const [jammerPowerWatts, setJammerPowerWatts] = useState(convertDbwToWatts(startSettingsState.jammerPower));
    const [jammerRangeUnits, setJammerRangeUnits] = useState(startSettingsState.jammerRangeUnits);
    const [showNoDataThresholds, setShowNoDataThresholds] = useState(startSettingsState.showNoDataThresholds);
    const [truncateToData, setTruncateToData] = useState(startSettingsState.truncateToData);
    const [backgroundOpacity, setBackgroundOpacity] = useState(startSettingsState.backgroundOpacity);
    const [fontSize, setFontSize] = useState(startSettingsState.fontSize);

    const jammerPower = Math.max(jammerPowerDbw, 0);
    const jammerConfig = showJammerRanges ? { jammerPower, jammerRangeUnits } : undefined;
    const defaultTitle = viewToDefaultTitle(view);
    const isRibbonChartView = view === ChartWorkspaceView.RibbonChart;
    const isPerformanceTablesView = view === ChartWorkspaceView.PerformanceTables;
    const allSystemOptions = allSystems.map((obj) => ({
        id: obj.id,
        systemName: obj.system
    }));
    const allSignalOptions = allSignals.map((obj) => ({
        id: obj.id,
        signalName: (obj.GNSS + ' ' + obj.signal)
    }));
    const chartWorkspaceSettingsProps: ChartWorkspaceSettingsProps = {
        view, title, setTitle, allSystems: allSystemOptions, allSignals: allSignalOptions, selectedSystems, setSelectedSystems,
        selectedSignals, setSelectedSignals, groupBySystem, setGroupBySystem, showJammerRanges, setShowJammerRanges,
        jammerPowerDbw, setJammerPowerDbw, jammerPowerWatts, setJammerPowerWatts, allJammerRangeUnits, fontSize, setFontSize,
        jammerRangeUnits, setJammerRangeUnits, aspectRatio, setAspectRatio, chartHeight, setChartHeight, showBarLabels, setShowBarLabels,
        showAxisBar, setShowAxisBar, showLegend, setShowLegend, useOrigColors, setUseOrigColors, useTestData, setUseTestData,
        showNoDataThresholds, setShowNoDataThresholds, truncateToData, setTruncateToData, backgroundOpacity, setBackgroundOpacity
    };

    function getCurrentSettingsState(): ChartSettings {
        return {
            title,
            selectedSystems,
            selectedSignals,
            useOrigColors,
            showBarLabels,
            showAxisBar,
            showLegend,
            showJammerRanges,
            useTestData,
            groupBySystem,
            aspectRatio,
            chartHeight,
            jammerPower,
            jammerRangeUnits,
            showNoDataThresholds,
            truncateToData,
            backgroundOpacity,
            fontSize
        };
    }

    // Update permalink with current settings state
    useEffect(() => {
        const currentSettingsState = getCurrentSettingsState();
        if (!isEqual(currentSettingsState, startSettingsState)) {
            onSettingsStateUpdate(currentSettingsState);
        }
    });

    // Retrieve systems
    useEffect(() => {
        arsenalService.getSystems()
            .then(setAllSystems)
            .catch(function (error) {
                setAllSystems([]);
            });
    }, [setAllSystems]);

    // Retrieve signals
    useEffect(() => {
        arsenalService.getSignals()
            .then(setAllSignals)
            .catch(function (error) {
                setAllSignals([]);
            });
    }, [setAllSignals]);

    return (
        <div
            ref={containerRef}
            className={classes.root}
            onClick={() => {
                if (showSettings) {
                    setShowSettings(false);
                }
            }}
        >
            <div className={clsx(classes.pageTitleContainer, 'margin-bottom-1x')}>
                <h1 className={classes.pageTitle}>{title || defaultTitle}</h1>
                <ToggleButtonGroup
                    value={view}
                    exclusive
                    className={filterFromExportClass}
                    onChange={(event, newView) => {
                        if (newView) {
                            // Update the view
                            setView(newView);

                            // Update the permalink
                            onSettingsStateUpdate(getCurrentSettingsState(), viewToRootUrl(newView));
                        }

                        // Don't collapse the settings panel
                        event.stopPropagation();
                    }}
                >
                    <ToggleButton
                        value={ChartWorkspaceView.RibbonChart}
                        className={'text-sm border border-left-radius margin-left-1x padding-half'}
                    >
                        <Tooltip title="Ribbon Chart"><EqualizerIcon /></Tooltip>
                    </ToggleButton>
                    <ToggleButton
                        value={ChartWorkspaceView.PerformanceTables}
                        className={'text-sm border border-right-radius padding-half'}
                    >
                        <Tooltip title="Performance Tables"><TableChartIcon /></Tooltip>
                    </ToggleButton>
                </ToggleButtonGroup>
                <Tooltip title={`${showSettings ? 'Hide' : 'Show'} settings panel`}>
                    <ToggleButton
                        value="showSettings"
                        className={clsx('text-sm border border-radius margin-left-1x padding-half', filterFromExportClass)}
                        selected={showSettings}
                        onChange={() => setShowSettings(!showSettings)}
                    >
                        <SettingsIcon fontSize="small" />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title="Export chart">
                    <div className={filterFromExportClass}>
                        <IconButton
                            disabled={!selectedSystems?.length || !selectedSignals?.length}
                            onClick={(event) => {
                                if (exportMenuAnchorElement) {
                                    setExportMenuAnchorElement(null);
                                } else {
                                    setExportMenuAnchorElement(event.currentTarget);
                                }
                            }}
                            className={'text-sm border border-radius margin-left-1x padding-half'}
                        >
                            <SaveAltIcon fontSize="small" />
                        </IconButton>
                    </div>
                </Tooltip>
                <Menu
                    id="basic-menu"
                    anchorEl={exportMenuAnchorElement}
                    open={Boolean(exportMenuAnchorElement)}
                    onClose={() => setExportMenuAnchorElement(null)}
                >
                    <MenuItem onClick={() => {
                        if (containerRef.current) {
                            exportToPngBlob(containerRef.current, classes.exportBlackText)
                                .then(function (blob) {
                                    if (blob) {
                                        saveAs(blob, `${title || defaultFileName}.png`);
                                    }
                                })
                                .finally(() => setExportMenuAnchorElement(null));
                        }
                    }}>
                        <ListItemIcon>
                            <ImageOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Export to PNG (Black Text)</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        if (containerRef.current) {
                            exportToPngBlob(containerRef.current, classes.exportWhiteText)
                                .then(function (blob) {
                                    if (blob) {
                                        saveAs(blob, `${title || defaultFileName}.png`);
                                    }
                                })
                                .finally(() => setExportMenuAnchorElement(null));;
                        }
                    }}>
                        <ListItemIcon>
                            <ImageIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Export to PNG (White Text)</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        if (containerRef.current) {
                            exportToPdfBlob(containerRef.current)
                                .then(function (blob) {
                                    if (blob) {
                                        saveAs(blob, `${title || defaultFileName}.pdf`);
                                    }
                                })
                                .finally(() => setExportMenuAnchorElement(null));
                        }
                    }}>
                        <ListItemIcon>
                            <PictureAsPdfIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Export to PDF</ListItemText>
                    </MenuItem>
                    {copySupported ? (
                        <MenuItem onClick={() => {
                            if (containerRef.current) {
                                exportToPngBlob(containerRef.current, classes.exportBlackText)
                                    .then(function (blob) {
                                        if (blob) {
                                            navigator.clipboard.write([
                                                new ClipboardItem({
                                                    'image/png': blob
                                                })
                                            ]);
                                        }
                                    })
                                    .finally(() => setExportMenuAnchorElement(null));
                            }
                        }}>
                            <ListItemIcon>
                                <ContentCopyIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Copy PNG (Black Text)</ListItemText>
                        </MenuItem>
                    ) : null}
                    {copySupported ? (
                        <MenuItem onClick={() => {
                            if (containerRef.current) {
                                exportToPngBlob(containerRef.current, classes.exportWhiteText)
                                    .then(function (blob) {
                                        if (blob) {
                                            navigator.clipboard.write([
                                                new ClipboardItem({
                                                    'image/png': blob
                                                })
                                            ]);
                                        }
                                    })
                                    .finally(() => setExportMenuAnchorElement(null));
                            }
                        }}>
                            <ListItemIcon>
                                <ContentCopyTwoToneIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Copy PNG (White Text)</ListItemText>
                        </MenuItem>
                     ) : null}
                </Menu>
            </div>
            <div
                className={clsx(classes.settingsPanel, { [classes.settingsPanelOpen]: showSettings, 'margin-bottom-2x': showSettings })}
                onClick={(event) => event.stopPropagation()}
            >
                <ChartWorkspaceSettings {...chartWorkspaceSettingsProps} />
            </div>
            <div className={clsx(classes.chartsContainer)} ref={chartsContainerRef} style={{ fontSize: `${fontSize}em` }}>
                {isRibbonChartView ? (
                    <RibbonChart
                        systems={selectedSystems}
                        signals={selectedSignals}
                        useOrigColors={useOrigColors}
                        showLabels={showBarLabels}
                        showAxis={showAxisBar}
                        showLegend={showLegend}
                        useTestData={useTestData}
                        groupBySystem={groupBySystem}
                        aspectRatio={aspectRatio}
                        chartHeight={chartHeight}
                        chartWidth={chartWidth}
                        jammerConfig={jammerConfig}
                        showNoDataThresholds={showNoDataThresholds}
                        truncateToData={truncateToData}
                        backgroundOpacity={backgroundOpacity}
                        fontSize={fontSize}
                    />
                ) : null}
                {isPerformanceTablesView ? (
                    <PerformanceTables
                        systems={selectedSystems.map((o) => [o, allSystems.find((s) => s.id === o.id) as System])}
                        signals={selectedSignals.map((o) => [o, allSignals.find((s) => s.id === o.id) as Signal])}
                        useTestData={useTestData}
                        showNoDataThresholds={showNoDataThresholds}
                        fontSize={fontSize}
                    />
                ) : null}
            </div>
        </div>
    );
}