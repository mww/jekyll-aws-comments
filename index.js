const Comments = require('./comments.js');
const config = require('./config.json');
const AWS = require('aws-sdk');
const moment = require('moment');
const util = require('util');

exports.postCommentHandler = async function(event) {
  AWS.config.update({region: config.sqs_region});
  const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

  var msg = {
    DelaySeconds: 0,
    MessageBody: JSON.stringify(event),
    QueueUrl: config.sqs_url
  };

  return new Promise(function(resolve, reject) {
    try {
      sqs.sendMessage(msg, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve('Success');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.sqsMessageHandler = async function(event) {
  console.log('Event: ' + util.inspect(event, { depth: 3 }));
  console.log('Config: ' + util.inspect(config, { depth: 0 }));

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
