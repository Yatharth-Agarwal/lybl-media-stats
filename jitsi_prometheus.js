const puppeteer = require('puppeteer-core');
const prometheus = require('prom-client');
const config = require('./config.js');
const fs = require('fs');

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

async function collectAndExportJitsiStats(meetingUrl) {
  const browser = await puppeteer.launch({
    executablePath: config.chromePath.length == 0 ? 'C://Program Files//Google//Chrome//Application//chrome.exe' : config.chromePath, // Path to your Chrome executable
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(meetingUrl);

  await page.waitForTimeout(30000); // 30000 milliseconds (30 seconds)
  setInterval(async () => {
    let stats = await page.evaluate(() => {
      return JSON.stringify(APP.conference.getStats());
    });
    console.log(stats);
    const jsonData = JSON.parse(stats);
    const prometheusMetrics = convertToPrometheus(jsonData).join('\n');
    fs.writeFileSync('metrics.prom', prometheusMetrics);
    console.log('Metrics have been written to metrics.prom');
  }, 5000); // Collect stats every 5 seconds

}
module.exports = collectAndExportJitsiStats;
