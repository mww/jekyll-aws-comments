const AWS = require('aws-sdk');

exports.handler = async (event) => {
  let region = process.env.AWS_REGION;
  let sqsUrl = process.env.SQS_URL;

  AWS.config.update({region: region});
  const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

  var msg = {
    DelaySeconds: 0,
    MessageBody: event.body,
    QueueUrl: sqsUrl
  };

  return new Promise(function(resolve, reject) {
    try {
      sqs.sendMessage(msg, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve({
            'statusCode': 200,
            'headers': {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Access-Control-Allow-Methods': '*'
            },
            'body': '{}'
          });
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};
