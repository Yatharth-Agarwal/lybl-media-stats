const config = require('./config');
const exportStats = require('./jitsi_prometheus');


for (let i=0;i<config.meetingUrls.length;i++) {
    console.log(config.meetingUrls[i]);
    exportStats(config.meetingUrls[i]);
}