var assert = require('assert');
var AWS = require('aws-sdk-mock');
var index = require('./../index.js');

const comment = {
  "name": "John Doe",
  "email": "john@doe.com",
  "url": "http://www.doe.com",
  "pageId": "/test",
  "comment": "Howdie, how are you doing?"
}

describe('postCommentHandler', function() {
  afterEach(() => {
       delete process.env.AWS_REGION;
       delete process.env.SNS_TOPIC_ARN;
   });

  it('publish message to SNS', async function() {
    process.env.AWS_REGION = 'us-west-2';
    process.env.SNS_TOPIC_ARN = 'fake-sns-arn';

    AWS.mock('SNS', 'publish', function(msg, callback) {
      let expected = JSON.stringify(comment);
      assert.equal(msg.Message, expected);
      assert.equal(msg.TopicArn, process.env.SNS_TOPIC_ARN);
      callback(null, { MessageId: 1 });
    });

    const res = await index.handler({body: JSON.stringify(comment)});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body, '{}');
    assert.equal(res.headers['Access-Control-Allow-Origin'], '*');
    assert.equal(res.headers['Access-Control-Allow-Headers'], '*');
    assert.equal(res.headers['Access-Control-Allow-Methods'], '*');

    AWS.restore('SNS');
  });

  it('error posting message to SNS', async function() {
    process.env.AWS_REGION = 'us-west-2';
    process.env.SNS_TOPIC_ARN = 'fake-sns-arn';

    AWS.mock('SNS', 'publish', function(msg, callback) {
      let expected = JSON.stringify(comment);
      assert.equal(msg.Message, expected);
      assert.equal(msg.TopicArn, process.env.SNS_TOPIC_ARN);
      callback(Error('A serious SNS error!'), null);
    });

    try {
      await index.handler({body: JSON.stringify(comment)});
    } catch (err) {
      assert.equal(err.message, 'A serious SNS error!');
    }

    AWS.restore('SNS');
  });
});
