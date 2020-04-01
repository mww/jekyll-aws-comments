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
       delete process.env.SQS_URL;
   });

  it('post message to SQS', async function() {
    process.env.AWS_REGION = 'us-west-2';
    process.env.SQS_URL = 'https://example.com/fake';

    AWS.mock('SQS', 'sendMessage', function(msg, callback) {
      let expected = JSON.stringify(comment);
      assert.equal(msg.MessageBody, expected);
      callback(null, { MessageId: 1 });
    });

    const res = await index.handler({body: JSON.stringify(comment)});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body, '{}');
    assert.equal(res.headers['Access-Control-Allow-Origin'], '*');
    assert.equal(res.headers['Access-Control-Allow-Headers'], '*');
    assert.equal(res.headers['Access-Control-Allow-Methods'], '*');

    AWS.restore('SQS');
  });

  it('error posting message to SQS', async function() {
    process.env.AWS_REGION = 'us-west-2';
    process.env.SQS_URL = 'https://example.com/fake';

    AWS.mock('SQS', 'sendMessage', function(msg, callback) {
      let expected = JSON.stringify(comment);
      assert.equal(msg.MessageBody, expected);
      callback(Error('Something went wrong!'), null);
    });

    return index.handler({body: JSON.stringify(comment)})
        .then(x => Promise.reject('should have failed'))
        .catch(e => {
          assert.equal(e.message, 'Something went wrong!');
          return Promise.resolve('expected an error');
        });
  });
});
