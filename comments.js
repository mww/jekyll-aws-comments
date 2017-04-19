var Octokat = require('octokat');
var moment = require('moment');
var md5 = require('js-md5');

module.exports = Comments;

function Comments(config) {
  var octo = new Octokat(config.credentials);
  this.repo = octo.repos(config.owner, config.repo);
  this.base = config.base;
}

Comments.prototype.submit = function(event) {
  var repo = this.repo;
  var base = this.base;
  var date = moment.utc();
  var email = event.email.trim().toLowerCase();
  var homepage = parseUrl(event.url);
  var name = event.name.trim();
  var content = pack(event.pageId, date, name, homepage, email, event.comment.trim());
  var commentId = date.format('YYYYMMDDTHHmmss');
  var branch = 'comment-' + commentId;
  
  return repo.git.refs.heads(base).fetch()
  .then(ref => // Crete new comment branch
    repo.git.refs.create({
      ref: 'refs/heads/' + branch,
      sha: ref.object.sha
    }))
  .then(() => // Commit comment file
    repo.contents('_comments/' + commentId + '.md').add({
      message: 'Add comment',
      content: new Buffer(content, 'utf8').toString('base64'),
      branch: branch
    }))
  .then(() => // Create pull request
    repo.pulls.create({
      title: 'New comment from ' + name,
      body: name + ' commented on \'' + event.postId + '\'.',
      head: branch,
      base: base
    }))
  .then(pull => pull.htmlUrl);
};

function pack(pageId, date, name, homepage, email, comment) {
  return '---\n' +
    'page_id: ' + pageId + '\n' +
    'date: ' +  date.toISOString() + '\n' +
    'name: ' + name + '\n' +
    'homepage: ' + homepage + '\n' +
    'mail_hash: ' + md5(email) + '\n' +
    '---\n\n' +
    comment + '\n';
}

function parseUrl(url) {
  if (!url) {
    return "";
  } else {
    var url1 = url.trim();
    if (url1.toLowerCase().substring(0, 4) === 'http')
      return url1;
    else
      return 'http://' + url1;
  }
}
