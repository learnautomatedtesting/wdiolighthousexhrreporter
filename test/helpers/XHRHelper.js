import { browser } from '@wdio/globals';

let xhrData = [];
let pendingRequests = {};
let xhrCount = 0;
let lastXHRInitiationTime = 0;
let isXHRMonitoring = true;
let filterPattern = null; // No filter by default

class XHRhelper {
   enable() {
    browser.on('Network.requestWillBeSent', (params) => {
        if (params.type === 'XHR' && isXHRMonitoring && this.matchesFilter(params.request.url)) {
            console.log('Network.requestWillBeSent detected!', params);  // Move log statement inside the conditional
            xhrCount++;
            lastXHRInitiationTime = new Date().getTime();
            pendingRequests[params.requestId] = { timestamp: params.timestamp, headers: params.request.headers };
        }
    });

    browser.on('Network.responseReceived', (params) => {
        if (params.type === 'XHR' && isXHRMonitoring && pendingRequests[params.requestId]) {
            console.log('Network.responseReceived detected!', params);  // Move log statement inside the conditional
            xhrCount--;
            const requestInfo = pendingRequests[params.requestId];
            const duration = params.timestamp - requestInfo.timestamp;
            xhrData.push({
                url: params.response.url,
                statusCode: params.response.status,
                duration: duration * 1000,
                requestHeaders: requestInfo.headers
            });
            delete pendingRequests[params.requestId];
        }
    });
}

    disableMonitoring() {
        console.log('Disabling XHR monitoring...');
        isXHRMonitoring = false;
    }

    enableMonitoring() {
        console.log('Enabling XHR monitoring...');
        isXHRMonitoring = true;
    }

    setFilterPattern(pattern) {

        console.log('fiter patern...');
        filterPattern = pattern;
    }

    matchesFilter(url) {
        return !filterPattern || url.includes(filterPattern);
    }

    async waitForXHRs(gracePeriod = 3000) {
        await browser.waitUntil(() => {
            const now = new Date().getTime();
            return xhrCount === 0 && (now - lastXHRInitiationTime > gracePeriod);
        }, {
            timeout: 30000,
            timeoutMsg: 'XHRs did not finish within the expected time.'
        });
    }

    resetXHRData() {
        xhrData = [];
    }

    getXHRData() {
        return xhrData;
    }
}

export default new XHRhelper;
