const Comments = require('./comments.js');
const config = require('./config.json');
const moment = require('moment');
const util = require('util');

exports.handler = async function(event) {
  console.log('Config: ' + util.inspect(config, { depth: 0 }));
  console.log('Event: ' + util.inspect(event, { depth: 3 }));

  return new Promise(function(resolve, reject) {
    const comments = new Comments(config);

    for (let i = 0; i < event.Records.length; i++) {
      let record = event.Records[i];

      try {
        let date = moment(parseInt(record.attributes.SentTimestamp))
        let comment = JSON.parse(record.body);

        comments.submit(comment, date)
            .then(function(url) {
              resolve('Success');
            })
            .catch(function(e) {
              reject(e);
            });
      } catch (e) {
        reject(e);
      }
    }
  });
};
