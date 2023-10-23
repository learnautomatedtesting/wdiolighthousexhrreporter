import { browser, $ } from '@wdio/globals'
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { config } from 'dotenv';
import fs from 'fs-extra';

import { exec } from 'child_process';
config();
import path from 'path';
import { fileURLToPath } from 'url'; // Import the fileURLToPath function from the 'url' module

// Use fileURLToPath to convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
    
// Now you can use __dirname in your code
const filePath = path.join(__dirname, 'lighthouse-metrics.json');

class CookieHelper {
    // Elements

    async storecookie(environment){
        const currentUrl = await browser.getUrl();
        await browser.url(`https://werkgever.${environment}.pmt.nl/api/auth/.well-known/jwks`);
    
        const cookies = await browser.getCookies();
        const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    
        const jsonObject = {
            cookies: cookieString
        };
    
        const filePathcookie = path.resolve(process.cwd(), 'cookies.json');
    
        await fs.writeJson(filePathcookie, jsonObject, { spaces: 2 });
        console.log(`Cookies have been written to ${filePathcookie}`);
    
        await browser.url(currentUrl);
}
  
async getCookiesFromFile(filepath) {
    // Define the file path
    const filePathcookie = path.resolve(process.cwd(), filepath);
    const data = await fs.readJson(filePathcookie);
    return data.cookies;
}


}
export default new CookieHelper();