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
