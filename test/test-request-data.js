import http from 'http';

import { PORT } from '../src/constants.js';

const options = {
  method: 'GET',
  hostname: 'localhost',
  port: PORT,
  path: '/',
};

const req = http.request(options, (res) => {
  res.on('data', (chunk) => {
    console.log('Received chunk:', chunk.toString());
  });
  res.on('end', () => {
    console.log('Response ended');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
