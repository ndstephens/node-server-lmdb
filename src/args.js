import { NUM_RECORDS } from './constants.js';

export function parseArgs(args) {
  const parsedArgs = {
    delay: false,
    numRecords: NUM_RECORDS,
  };

  args.forEach((arg) => {
    if (arg.startsWith('--delay=')) {
      const delayValue = arg.split('=')[1];
      if (delayValue === 'true') {
        parsedArgs.delay = true;
      } else if (delayValue === 'false') {
        parsedArgs.delay = false;
      } else {
        console.error(
          'Invalid delay argument. Use --delay=true or --delay=false'
        );
      }
    } else if (arg.startsWith('--numRecords=')) {
      const numRecordsValue = parseInt(arg.split('=')[1], 10);
      if (!isNaN(numRecordsValue)) {
        parsedArgs.numRecords = numRecordsValue;
      } else {
        console.error(
          `Invalid number of records. Using default value of ${NUM_RECORDS}.`
        );
      }
    }
  });

  return parsedArgs;
}
