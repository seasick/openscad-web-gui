#!/usr/bin/env node
const cors_proxy = require('cors-anywhere');

// Listen on a specific host via the HOST environment variable
const host = process.env.CORS_HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
const port = process.env.CORS_PORT || 8888;

cors_proxy
  .createServer({
    originWhitelist: [], // Allow all origins
  })
  .listen(port, host, function () {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
  });
