export interface System {
    system: string;
    id: number;
    type: string;
    use: string;
    country: string;
    agency: string;
    inInventory: string;
    class: string;
    configClass: string;
    asOfDate: number;
    receiverAliasId: number;
    receiverId: number;
    imuAliasId: number;
    imuId: number;
    couplingType: string;
    antennaAliasId: number;
    antennaId: number;
    aeId: number;
    aeAliasId: number;
    antiJamAliasId: number;
    antiJamId: number;
    notes: string;
    sources: string;
}

export interface Signal {
    id: number;
    name: string;
    signal: string;
    GNSS: string;
    freq: number;
    bandwidth: number;
    waveform: string;
    rcvdPwr: number;
    acq: number;
    trk: number;
    classification: string;
    signalHeader: string;
}

export interface Threshold {
    system: string;
    systemId: number;
    signal: string;
    signalId: number;
    units: string;
    degAcq: number;
    noAcq: number;
    degTrk: number;
    noTrk: number;
    degAcqEst: boolean;
    noAcqEst: boolean;
    degTrkEst: boolean;
    noTrkEst: boolean;
    asOfDate: number;
    configData: {
        systemCountry: string;
        systemAgency: string;
        systemType: string;
        systemUse: string;
        receiverName: string;
        coupling: string;
        imu: string;
        antennaName: string;
        antennaElectronics: string;
        antiJamInfo: string;
    };
    jammerRanges?: number[];
}

export function thresholdMaxData(threshold: Threshold) {
    return Math.max(threshold.degAcq || 0, threshold.degTrk || 0, threshold.noAcq || 0, threshold.noTrk || 0);
}

export function thresholdHasData(threshold: Threshold) {
    return Boolean(thresholdMaxData(threshold));
}
