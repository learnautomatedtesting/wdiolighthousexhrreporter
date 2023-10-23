import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import { browser, $ } from '@wdio/globals';

class LighthouseHelper {

    async runAudit(strtestcase, uriportaal) {
        const currentUrl = await browser.getUrl();
        await browser.url('https://werkgever.preprod.pmt.nl/api/auth/.well-known/jwks')
        console.log('URL at the time of running Lighthouse:', currentUrl);

        // Get cookies from the WebDriverIO browser session
        const currentCookies = await browser.getCookies();
        await browser.pause(3000);

        await browser.url(currentUrl);

        // Launch a new Chrome instance
        const chrome = await launch({ port: 9222, chromeFlags: ['--headless'] });

        // Connect Puppeteer to the Chrome instance
        const browserPuppeteer = await puppeteer.connect({ browserURL: `http://localhost:${chrome.port}` });
        const page = await browserPuppeteer.newPage();

        // Set cookies in the Puppeteer page
        await page.setCookie(...currentCookies);
        await page.goto(currentUrl);

        // Configure Lighthouse options
        const options = { logLevel: 'info', output: 'html', port: chrome.port, emulatedFormFactor: 'desktop' };

        let runnerResult;
        try {
            runnerResult = await lighthouse(currentUrl, options);
        } catch (error) {
            console.error('Error running Lighthouse:', error);
            await chrome.kill();
            return;
        }

        // Save the report and handle results
        const reportHtml = runnerResult.report;
        fs.writeFileSync('./app/reporting/LightHouseReports/' + strtestcase + '.html', reportHtml);

        // Extract the specific metrics
        console.log(runnerResult)
        const metrics = {
            firstContentfulPaint: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
            speedIndex: runnerResult.lhr.audits['speed-index'].numericValue,
            largestContentfulPaint: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
            interactive: runnerResult.lhr.audits.interactive.numericValue,
            totalBlockingTime: runnerResult.lhr.audits['total-blocking-time'].numericValue,
            performanceScore: runnerResult.lhr.categories.performance.score,
         //   domContentLoaded: runnerResult.lhr.timing['domContentLoaded'], // Add this line
            // Add more metrics as needed
        };

        // Close the Puppeteer connection and the Chrome instance
        await browserPuppeteer.disconnect();
        await chrome.kill();

        return metrics;
    }

    // Note: I'm commenting out the old runLighthouseAudit as it seems like you were questioning its use.
    // If you still need it, you can uncomment or modify as needed.
    // async runLighthouseAudit() {
    // ... your previous code
    // }

}

export default new LighthouseHelper();
