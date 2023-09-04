const puppeteer = require('puppeteer-core');
const express = require('express');
const prometheus = require('prom-client');
const config = require('./config.js');
const fs = require('fs');
const app = express();

// function exportStats() {

  function convertToPrometheus(json, prefix = '') {
    // Function to recursively convert nested JSON into Prometheus format
    let metrics = [];

    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        const value = json[key];
        const metricName = prefix ? `${prefix}_${key}` : key;
        if (typeof value === 'object') {
          metrics = metrics.concat(convertToPrometheus(value, metricName));
        } else {
          metrics.push(`${metricName} ${value}`);
        }
      }
    }
    return metrics;
  }

  async function collectJitsiStats(meetingUrl) {
    const browser = await puppeteer.launch({
      executablePath: config.chromePath.length == 0?'C://Program Files//Google//Chrome//Application//chrome.exe':config.chromePath, // Path to your Chrome executable
      headless: true
    });

    const page = await browser.newPage();
    await page.goto(meetingUrl);
    
    await page.waitForTimeout(30000); // 20000 milliseconds (20 seconds)
    let stats = null;
    // console.log("page is = ")
    // console.log(page.evaluate.name);
    stats = await page.evaluate(() => {
      return JSON.stringify(APP.conference.getStats());
      // if (typeof APP === 'object' && typeof APP.conference === 'object' && typeof APP.conference.getStats === 'function') {
      //     return JSON.stringify(APP.conference.getStats());
      // } else {
      //     return null; // Return null if the necessary objects/functions are not available
      // }
    });
    const filePath = 'output.json';

    // fs.writeFileSync(filePath, stats);
    console.log('stats are ' + stats);
    // await browser.close();

    const jsonData = JSON.parse(fs.readFileSync('output.json', 'utf8'));
    const prometheusMetrics = convertToPrometheus(jsonData).join('\n');
    fs.writeFileSync('metrics.prom', prometheusMetrics);
    console.log('Metrics have been written to metrics.prom');
    // console.log(page.evaluate.name);
    // setTimeout(page.evaluate, 5000);
  };
// }

module.exports = collectJitsiStats;