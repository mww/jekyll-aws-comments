var index = require('./index.js');
var testEvent = require('./test/test_event.json');
var moment = require('moment');

let event = {
  Records: [
    {
      body: JSON.stringify(testEvent),
      attributes: {
        SentTimestamp: moment.utc().valueOf().toString(10)
      }
    }
  ]
};

index.sqsMessageHandler(event)
    .then(res => console.log('==> ' + res))
    .catch(err => console.error('==> ' + err));
