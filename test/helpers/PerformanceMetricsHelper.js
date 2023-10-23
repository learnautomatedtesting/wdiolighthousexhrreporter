import LighthouseHelper from './LighthouseHelper.js';
import PerformanceHelper from './PerformanceHelper.js';
import XHRHelper from './XHRHelper.js';

export default class PerformanceMetricsHelper {

    static async captureAndAggregatePerformanceData(testStepName, captureLighthouse = true, captureXHR = true) {
        let aggregatedData = {};
        let lighthouseMetrics = null;

        if (captureXHR) {
            const performanceData = await PerformanceHelper.captureAndAggregatePerformanceData(testStepName);
            aggregatedData = { ...aggregatedData, ...performanceData };
        }

        if (captureLighthouse) {
            lighthouseMetrics = await LighthouseHelper.runAudit(testStepName);
        }

        // Combine data into the structured format
        const structuredData = this.structurePerformanceData(testStepName, aggregatedData, null, null, lighthouseMetrics);
        return structuredData;
    }

    static structurePerformanceData(label, metricsData, networkData, fullLoadTime, lighthouseMetrics = null) {
        const structuredData = {
            [label]: {
                metrics: metricsData,
                network: networkData,
                fullLoadTime: fullLoadTime,
            }
        };

        if (lighthouseMetrics) {
            structuredData[label].lighthouse = lighthouseMetrics;
        }

        return structuredData;
    }
}