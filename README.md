# Jekyll AWS Comments

[![Dependencies](https://img.shields.io/david/mww/jekyll-aws-comments.svg)](https://david-dm.org/mww/jekyll-aws-comments)
[![Dev dependencies](https://img.shields.io/david/dev/mww/jekyll-aws-comments.svg)](https://david-dm.org/mww/jekyll-aws-comments?type=dev)

[Static comments for Jekyll with AWS Lambda and GitHub](http://ummels.github.io/jekyll-aws-comments).

To build a zip file that can be uploaded to AWS run:
```bash
$ npm install
$ npm run build-aws-lambda
```

Then you will have a new file named `jekyll-aws-comments.zip` in your directory that can be uploaded to Lambda.

Will use two different lambdas, both using the same code.

postCommentFromUser -> Takes the comment from a post message and puts it onto the SQS queue, returns to user quickly.
createCommentPullRequest -> Triggered by a message on the SQS queue, takes it and creates a pull request.
  * Increase timeout to 10s

The two queues are to make posting the comment faster from the end users point of view.
