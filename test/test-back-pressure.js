import http from 'http';

import { PORT } from '../src/constants.js';

const options = {
  method: 'GET',
  hostname: 'localhost',
  port: PORT,
  path: '/',
};

const req = http.request(options, (res) => {
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log('Received chunk:', chunk);
    // Pause reading to simulate slow processing
    res.pause();
    // Resume after a delay (simulate slow consumption)
    setTimeout(() => {
      res.resume();
    }, 20);
  });

  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
