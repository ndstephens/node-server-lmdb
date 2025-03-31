# Node server with LMDB store

A simple NodeJS HTTP server that will listen for HTTP requests, and when a request is
received, it will read all the entries from an LMDB store with lmdb-js, and stream them back to
the client in JSON format.

The iterator will pause when there is network back-pressure, and terminate and close
the iterator if the connection is closed early.

The files have an excessive amount of code comments and console logs for monitoring and debugging, plus to explain some of the thought process involved.

## Setup and run

- Open a terminal window
- `npm i` to install the required packages
- `npm run dev` to initialize the database and run the server
- Wait until the server is listening, then...
- To send a request to the server you can:
  - Open a separate terminal instance and run `npm run test-request-data`
  - Open your browser and navigate to <http://localhost:3000> (having a browser extension that nicely parses JSON is helpful)
- View the terminal output(s)

**NOTE:** Because the database is filled with 2000 records by default, that should be sufficient to trigger some network back-pressure. You should notice in the output of the server terminal instance `"Back-pressure detected, waiting for drain event..."` and `"Drain event received, continuing..."`. This worked on my M1 2020 MacBook Air. I suppose under certain conditions 2000 records may not be enough.

## Monitor streaming

To view the streaming at a more manageable rate:

- `npm run dev-watch-stream` in one terminal instance (this adds an artificial delay to the data streaming and only adds 500 records to the database)
- Wait until the server is listening, then...
- `npm run test-request-data` in a separate terminal to view the data as it is streamed

## Test handling of network back-pressure

As stated under [Setup and run](#setup-and-run), the default server config should demonstrate network back-pressure being handled. Again, the two terminal commands are:

- `npm run dev` in one terminal instance
- Wait until the server is listening, then...
- `npm run test-request-data` in a separate terminal instance

I had initially created the `test-back-pressure` script for this test, but then realized it wasn't necessary. I kept the code in case I find a use for it.

## Test handling of connection closing early

To test how the server handles a connection closing early (before streaming is finished) please do the following:

- `npm run dev-delay` in one terminal instance
- Wait until the server is listening, then...
- `npm run test-close-connection` in a separate terminal instance

Monitor the output of the server terminal instance.
