import axios from 'axios';
import { flatMap } from 'lodash-es';

import { Signal, System, Threshold, thresholdHasData } from './arsenal-service.model';

interface SystemsResponse {
    message: string;
    data: System[];
}

interface SignalsResponse {
    message: string;
    data: Signal[];
}

interface JammerConfig {
    jammerPower: number;
    jammerRangeUnits: string;
}

interface ThresholdSystem {
    id: number;
    systemNameOverride?: string;
}

type ThresholdResponse = Omit<Threshold, 'signalId' | 'systemId'>;

interface ThresholdSignal {
    id: number;
    signalNameOverride?: string;
}

export const arsenalService = {
    getSystems: async function(): Promise<System[]> {
        return axios.get<SystemsResponse>(process.env.REACT_APP_API_URL + '/api/rows/systems')
            .then((response) => response.data.data);
    },

    getSignals: async function(): Promise<Signal[]> {
        return axios.get<SignalsResponse>(process.env.REACT_APP_API_URL + '/api/rows/signals')
            .then((response) => response.data.data);
    },

    getThreshold: async function(
        systemId: number,
        signalId: number,
        useTestData: boolean,
        jammerConfig?: JammerConfig
    ): Promise<Threshold> {
        return axios.get<ThresholdResponse>(process.env.REACT_APP_API_URL + '/api/thresholds', {
            params: {
                systemId,
                signalId,
                useTestData,
                ...jammerConfig || {}
            }
        }).then((response) => ({ ...response.data, systemId, signalId }));
    },

    getThresholds: async function(
        systems: ThresholdSystem[],
        signals: ThresholdSignal[],
        useTestData: boolean,
        excludeNoData = false,
        jammerConfig?: JammerConfig
    ): Promise<Threshold[]> {
        const combinations = flatMap(systems, (system) => signals.map((signal) => ({ system, signal })));
        return Promise.all(combinations.map(async (c) => {
            const threshold = await arsenalService.getThreshold(c.system.id, c.signal.id, useTestData, jammerConfig);
            return {
                ...threshold,
                system: c.system.systemNameOverride || threshold.system,
                signal: c.signal.signalNameOverride || threshold.signal
            };
        })).then((thresholds) => excludeNoData ? thresholds.filter(thresholdHasData) : thresholds);
    }
}
