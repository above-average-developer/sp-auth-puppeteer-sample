import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as minimist from 'minimist';

import { authPuppeteer } from './auth';

const args = minimist(process.argv.slice(2));

(async () => {

  // Optional window and viewport dimentions config
  const width = 1920;
  const height = 1080;

  console.time('Execution time');

  const browser = await puppeteer.launch({
    headless: args['headless'] === 'false' ? false : true,
    args: [ `--window-size=${width},${height}` ]
  });

  try {

    const page = await browser.newPage();
    const siteUrl = await authPuppeteer(page, args['configPath']);

    await page.setViewport({ width, height });
    await page.goto(siteUrl, {
      waitUntil: [ 'networkidle0', 'domcontentloaded' ]
    });

    /* Here comes puppeteer logic: UI tests, screenshots, etc. */

    // Create site page screenshot
    const dir = './screens';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const filename = new Date().toISOString().replace(/(:|\.)/g, '_');
    await page.screenshot({
      path: path.join(dir, `${filename}.png`)
    });

    // Print page title
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);

    // Print anchor tags links
    // const links = await page.$$eval('a', links => {
    //   return links.map(link => link.getAttribute('href'))
    //     .filter(href => {
    //       return href !== null &&
    //         href.indexOf('#') !== 0 &&
    //         href.indexOf('javascript:') !== 0;
    //     });
    // });
    // console.log('Links on page:', links.join(', '));

  } catch (ex) {
    console.log(`Error: ${ex.message}`);
  } finally {
    await browser.close();
  }

  console.timeEnd('Execution time');
})()
  .catch(console.warn);
