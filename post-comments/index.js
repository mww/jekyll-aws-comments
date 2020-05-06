const AWS = require('aws-sdk');

exports.handler = async (event) => {
  let region = process.env.AWS_REGION;
  let topicArn = process.env.SNS_TOPIC_ARN;

  AWS.config.update({region: region});
  const sns = new AWS.SNS({apiVersion: '2010-03-31'});

  var params = {
    Message: event.body,
    TopicArn: topicArn
  };

  return sns.publish(params).promise()
      .then(resp => {
        return {
          'statusCode': 200,
          'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*'
          },
          'body': '{}'
        };
      })
      .catch(err => {
        console.log('error publishing message to SNS: ' + err.message);
        throw err;
      });
};
