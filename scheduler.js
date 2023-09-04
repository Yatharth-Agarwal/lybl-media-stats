// File: scheduler.js

const cron = require('node-cron');
const myScript = require('./jitsi_prometheus.js');
const config = require('./config.js')

// Schedule your script to run every 5 minutes (Cron-like syntax)
const cronTime = '*/' + config.scrapeInterval + " * * * * *";
// console.log(cronTime);
cron.schedule(cronTime, () => {
  myScript();
});
