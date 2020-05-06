const Comments = require('./comments.js');
const config = require('./config.json');
const moment = require('moment');
const util = require('util');

exports.handler = async function(event) {
  //console.log('Config: ' + util.inspect(config, { depth: 0 }));
  //console.log('Event: ' + util.inspect(event, { depth: 3 }));

  const comments = new Comments(config);
  let promises = [];
  for (let i = 0; i < event.Records.length; i++) {
    let record = event.Records[i];

    let date = moment(record.Sns.Timestamp);
    let comment = JSON.parse(record.Sns.Message);

    let p = comments.submit(comment, date)
        .catch(err => {
          console.log('error submitting comment to SNS', err);
        });

    promises.push(p);
  }

  return Promise.all(promises)
      .then(values => 'Success');
};
