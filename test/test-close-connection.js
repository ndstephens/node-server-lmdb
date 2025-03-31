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

// Disconnect
setTimeout(() => {
  console.log('Aborting connection...');
  req.destroy();
  console.log('\n');
  console.log('** Did you remember to run the dev-delay script? **');
  console.log('** If not, please run it before running this test. **');
  console.log('** This test will not work successfully without it. **');
}, 200);
