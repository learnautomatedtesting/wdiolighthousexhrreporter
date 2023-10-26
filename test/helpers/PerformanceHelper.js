import { browser } from '@wdio/globals';
import XHRHelper from './XHRHelper.js';

class PerformanceHelper {

    async captureAndAggregatePerformanceData(strvalue,specificAPIEndpointSegment = null) {
        const currentUrl = await browser.getUrl();

        if (!currentUrl || currentUrl === 'about:blank') {
            throw new Error("No URL loaded in the browser before attempting to capture metrics.");
        }

        // Saving a screenshot (optional, based on your original code)
        const screenshotPath = `./app/reporting/performancehelper/reportgenerator/screenshotoutput/${strvalue}.png`;
        await browser.saveScreenshot(screenshotPath);

        // Capturing navigation timings from the browser
        const navigationTimings = await browser.execute(() => performance.getEntriesByType('navigation')[0]);
        const fullLoadTime = navigationTimings.loadEventEnd - navigationTimings.fetchStart;

        // Fetching browser performance metrics
        const performanceMetrics = await browser.cdp('Performance', 'getMetrics');

        // Wait for all XHRs to be completed
        await XHRHelper.waitForXHRs();

        // Fetching XHR data
        const xhrData = await XHRHelper.getXHRData();


      
        if (specificAPIEndpointSegment) {
            // Check for errors in XHRs that match the specific segment
            const xhrErrors = xhrData.filter(entry => 
                entry.url.includes(specificAPIEndpointSegment) && entry.statusCode !== 200
            );

            if (xhrErrors.length) {
                const error = xhrErrors[0];  // or process multiple errors if necessary
                console.error(`Error detected in API: ${error.url}. Status Code: ${error.statusCode}.`);
                return { error: true, errorMessage: `Error detected in API: ${error.url}` };
            }
        }
        console.log("xhrDatais:" + xhrData);

        // Resetting XHR data (optional, based on your original code)
        await XHRHelper.resetXHRData();

        return {
            metrics: performanceMetrics,
            network: xhrData,
            fullLoadTime: fullLoadTime
        };
    }
}

export default new PerformanceHelper();
