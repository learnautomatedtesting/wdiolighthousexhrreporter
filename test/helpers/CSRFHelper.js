import { browser, $ } from '@wdio/globals'
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { config } from 'dotenv';
import fs from 'fs-extra';
import XHRHelper from '../helpers/XHRHelper.js'; 

import { exec } from 'child_process';
config();
import path from 'path';
import { fileURLToPath } from 'url'; // Import the fileURLToPath function from the 'url' module

// Use fileURLToPath to convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


    
class CSRFHelper{

    async storeCSRF(xhrData){
    // Loop through the collected XHR data to extract specific headers
    const headersArray = xhrData.map(xhr => {
        return {
            'X-CSRF': xhr.requestHeaders['X-CSRF']
            // Cookie will be added later
        };
    });

      // Write the headersArray to a file
      const filePath = path.resolve(process.cwd(), 'headers.json');
      fs.writeFileSync(filePath, JSON.stringify(headersArray, null, 2));
      console.log(`Headers have been written to ${filePath}`);

    }
    }

      export default new  CSRFHelper();