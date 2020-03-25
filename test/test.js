var assert = require('assert');
var AWS = require('aws-sdk-mock');
var nock = require('nock');
var testEvent = require('./test_event.json');
var index = require('./../index.js');
var config = require('./../config.json');

describe('postCommentHandler', function() {
  it('post message to SQS', async function() {
    AWS.mock('SQS', 'sendMessage', function(msg, callback) {
      let expected = JSON.stringify(testEvent);
      assert.equal(msg.MessageBody, expected);
      callback(null, { MessageId: 1 });
    });

    const res = await index.postCommentHandler(testEvent);
    assert.equal(res, 'Success');

    AWS.restore('SQS');
  });

  it('error posting message to SQS', async function() {
    AWS.mock('SQS', 'sendMessage', function(msg, callback) {
      let expected = JSON.stringify(testEvent);
      assert.equal(msg.MessageBody, expected);
      callback(Error('Something went wrong!'), null);
    });

    return index.postCommentHandler(testEvent)
        .then(x => Promise.reject('should have failed'))
        .catch(e => {
          assert.equal(e.message, 'Something went wrong!');
          return Promise.resolve('expected an error');
        });
  });
});

// Make sure that all the expected GitHub API calls are made.
describe('sqsMessageHandler', function() {
  it('handle SQS Message', async function() {

    let path = '/repos/' + config.owner + '/' + config.repo + '/git/refs/heads/master';
    nock('https://api.github.com')
        .get(path)
        .reply(200, {
            'ref': 'refs/heads/master',
            'object': {
              'sha': '712921541bf6bb1077a152c273a6a0b200a53689',
              'type': 'commit',
            }
        });

    path = '/repos/' + config.owner + '/' + config.repo + '/git/refs';
    nock('https://api.github.com')
        .post(path, {
          'ref': 'refs/heads/comment-20200325T103800',
          'sha':'712921541bf6bb1077a152c273a6a0b200a53689'
        })
        .reply(201, {
          'ref':'refs/heads/comment-20200325T103800',
          'object':{
            'sha':'712921541bf6bb1077a152c273a6a0b200a53689',
            'type':'commit',
          }
        });

    path = '/repos/' + config.owner + '/' + config.repo + '/contents/_data/comments/_test-20200325T103800.yml';
    nock('https://api.github.com')
        .put(path, {
          'message':'Add comment',
          'content':/\w+/,
          'branch':'comment-20200325T103800'
        })
        .reply(201, {
          'commit':{
            'sha':'03426672a72d932e4732d360821808ea1d845d20',
            'message':'Add comment',
          }
        });

    path = '/repos/' + config.owner + '/' + config.repo + '/pulls';
    let htmlUrl = 'https://github.com/' + config.owner + '/' + config.repo + '/pull/30'
    nock('https://api.github.com')
        .post(path, {
          'title':'New comment from John Doe',
          'body':'John Doe commented on \'/test\'.',
          'head':'comment-20200325T103800',
          'base':'master'
        })
        .reply(201, {
          'html_url': htmlUrl
        });

    let event = {
      Records: [
        {
          body: JSON.stringify(testEvent),
          attributes: {
            SentTimestamp: '1585157880854'
          }
        }
      ]
    };
    await index.sqsMessageHandler(event);

    assert.equal(nock.isDone(), true);
    nock.restore();
  });
});

// index.handler(event, null, ((err, res) => {
//   if (err === null) {
//     console.log('==> ' + res);
//   } else {
//     console.error('==> ' + err);
//   }
// }));
