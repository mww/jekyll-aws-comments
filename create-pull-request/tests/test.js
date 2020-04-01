var assert = require('assert');
var nock = require('nock');
var index = require('./../index.js');
var config = require('./../config.json');

const comment = {
  "name": "John Doe",
  "email": "john@doe.com",
  "url": "http://www.doe.com",
  "pageId": "/test",
  "comment": "Howdie, how are you doing?\nThis is a long comment. It even has code in it\n`int x = 10;`\n\nWhat more is needed?"
}

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
          body: JSON.stringify(comment),
          attributes: {
            SentTimestamp: '1585157880854'
          }
        }
      ]
    };
    await index.handler(event);

    assert.equal(nock.isDone(), true);
    nock.restore();
  });
});
