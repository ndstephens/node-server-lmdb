import { createServer } from 'http';
import { open } from 'lmdb';

import { DB_PATH, PORT } from './src/constants.js';
import { populateDatabase } from './src/db.js';
import { parseArgs } from './src/args.js';

// Parse command line arguments
const { delay: isStreamingDelayed, numRecords } = parseArgs(
  process.argv.slice(2)
);
// console.log('Arguments:', process.argv.slice(2));

function finalizeResponse(isConnectionClosed, res, message) {
  // Only close the JSON array if connection not already closed
  if (!isConnectionClosed && !res.writableEnded) {
    res.write('\n]');
    res.end();
    console.log(message);
  }
}

// Create a new LMDB database
const db = open({
  path: DB_PATH,
  compression: true,
});

// Populate the database unless it already exists with correct number of records
if (db.getCount() !== numRecords) {
  db.clearSync();
  console.log('Database cleared');
  console.log('Populating database...');
  await populateDatabase(db, numRecords);
}

const server = createServer(async (req, res) => {
  // Error out early
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let isStartOfArray = true;
  let isConnectionClosed = false;

  // Set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');

  // Start the JSON array
  res.write('[\n');
  console.log('Streaming started...');

  try {
    const iterator = db.getRange();

    // Handle client disconnection
    res.on('close', () => {
      console.log('Connection closed by client');
      isConnectionClosed = true;
      // Terminate the iterator if possible
      if (iterator.return) {
        // Don't think this is working or doing anything...
        iterator.return();
      }
    });

    // Iterate through data
    for await (const entry of iterator) {
      // Exit if connection is closed
      if (isConnectionClosed) {
        console.log('Exiting loop');
        break;
      }
      // Add comma for all except the opening bracket and the last item (since it's hard to know if you're on the last item)
      if (!isStartOfArray) {
        res.write(',\n');
      } else {
        isStartOfArray = false;
      }
      // Stream the individual items as JSON
      // Check for back-pressure. If `write` returns false, wait for the drain event before continuing
      if (!res.write(JSON.stringify(entry))) {
        console.log('Back-pressure detected, waiting for drain event...');
        await new Promise((resolve) => {
          res.once('drain', () => {
            console.log('Drain event received, continuing...');
            resolve();
          });
        });
      }

      // Add artificial delay to observe streaming. Also useful for testing early connection closure
      if (isStreamingDelayed) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    finalizeResponse(
      isConnectionClosed,
      res,
      'Streaming completed successfully'
    );
  } catch (error) {
    console.error('Error streaming database results:', error);
    // If no data sent yet, return an error
    // Otherwise end the response with proper JSON
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Database error' }));
    } else {
      finalizeResponse(
        isConnectionClosed,
        res,
        'Error occurred after data was sent, closing response'
      );
    }
  }
});

server.listen(PORT, () => {
  console.log(`Database has ${db.getCount()} records`);
  console.log(`Server is listening on http://localhost:${PORT}`);
  if (isStreamingDelayed) {
    console.log('** Artificial streaming delay is enabled **');
  }
});
