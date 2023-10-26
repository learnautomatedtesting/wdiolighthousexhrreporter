import LighthouseHelper from './LighthouseHelper.js';
import PerformanceHelper from './PerformanceHelper.js';
import XHRHelper from './XHRHelper.js';

export default class PerformanceMetricsHelper {

    static async captureAndAggregatePerformanceData(testStepName, captureLighthouse = true, captureXHR = true,specificAPIEndpoint) {
        let aggregatedData = {};
        let lighthouseMetrics = null;
        let performanceData
        if (captureXHR) {
            performanceData = await PerformanceHelper.captureAndAggregatePerformanceData(testStepName, specificAPIEndpoint);
            aggregatedData = { ...aggregatedData, ...performanceData };
            
            // Check for the error immediately after getting the performanceData
            if (performanceData.error) {
                // Reset the XHR data before exiting
                await XHRHelper.resetXHRData();
                
                console.error(performanceData.errorMessage);
                return null;  // Exit the function without throwing an error
            }
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