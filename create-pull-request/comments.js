const Octokat = require('octokat');
const md5 = require('js-md5');

module.exports = Comments;

function Comments(config) {
  const octo = new Octokat(config.credentials);
  this.repo = octo.repos(config.owner, config.repo);
  this.base = config.base;
}

Comments.prototype.submit = function(event, date) {
  const repo = this.repo;
  const base = this.base;
  const email = event.email.trim().toLowerCase();
  const homepage = parseUrl(event.url);
  const name = event.name.trim();
  const content = pack(event.pageId, date, name, homepage, email, event.comment.trim());
  const commentId = date.format('YYYYMMDDTHHmmss');
  const branch = 'comment-' + commentId;

  let filename = event.pageId + '-' + commentId + '.yml';
  filename = filename.replace(/\//g, '_');

  return repo.git.refs.heads(base)
      .fetch()
      .then(ref => // Crete new comment branch
        repo.git.refs.create({
          ref: 'refs/heads/' + branch,
          sha: ref.object.sha
        }))
      .then(() => // Commit comment file
        repo.contents('_data/comments/' + filename).add({
          message: 'Add comment',
          content: Buffer.from(content, 'utf8').toString('base64'),
          branch: branch
        }))
      .then(() => // Create pull request
        repo.pulls.create({
          title: 'New comment from ' + name,
          body: name + ' commented on \'' + event.pageId + '\'.',
          head: branch,
          base: base
        }))
      .then(pull => pull.htmlUrl);
};

function pack(pageId, date, name, homepage, email, comment) {
  let msg = 'page_id: ' + pageId + '\n' +
    'date: ' +  date.toISOString() + '\n' +
    'name: ' + name + '\n' +
    'homepage: ' + homepage + '\n' +
    'mail_hash: ' + md5(email) + '\n' +
    'msg: |\n';
  lines = comment.split('\n');
  for (i = 0; i < lines.length; i++) {
    msg += '  ' + lines[i] + '\n';
  }
  return msg;
}

function parseUrl(url) {
  if (!url) {
    return "";
  } else {
    const url1 = url.trim();
    if (url1.toLowerCase().substring(0, 4) === 'http')
      return url1;
    else
      return 'http://' + url1;
  }
}
