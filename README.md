# Jekyll AWS Comments

Let users create comments for your blog powered by [GitHub Pages](https://pages.github.com/)/[Jekyll](https://jekyllrb.com/). This is targeted at sites that don't get a large number of comments and can make use of the free tier in AWS.

This works by setting up an AWS stack that accepts the comments and then creates a GitHub pull request in your GitHub pages repository. Once the PR is merged then the page will be regenerated with the new comment.

### Deployment

This repo is laid out as an [AWS Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/) application. Therefore the easiest way to deploy the entire stack is to use SAM. Once you have SAM installed on your computer can simply use:

```bash
$ sam build
$ sam deploy --guided
```

The `sam deploy --guided` command will walk you through the deployment process asking you a few questions. A very important parameter it will ask you about is `CorsAllowOriginParameter`. You can set this parameter to your domain so that requests from other domains will be rejected. The default value is `'*'` which allows all sites to send requests.

```
Parameter CorsAllowOriginParameter ['*']: 'https://www.theelements.org'
```

For the CorsAllowOriginParameter to be valid the site must be surrounded by single quote (`'`) marks.

At the end of the deployment process SAM will output some information about the deployment including the URL that you can use to post comments.

```
CloudFormation outputs from deployed stack
-----------------------------------------------------------------------------------------------------------------------------------------
Outputs
-----------------------------------------------------------------------------------------------------------------------------------------
Key                 CommentApi
Description         API Gateway endpoint URL for Prod stage for Hello World function
Value               https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/Prod/comment/
-----------------------------------------------------------------------------------------------------------------------------------------
```

Simply post comment request to that URL.

### Using comments on your site

Comments are stored as data in your repository at `_data/comments`. The comments are named with the page id and a timestamp. This is to keep all of the comments for a specific post together and sorted by post time.

To post comments you can use something like this JQuery snippet.

```javascript
$.ajax({
  type: 'POST',
  url: API_ENDPOINT_URL, // Put the URL of your API endpoint here
  contentType: 'application/json',
  data: JSON.stringify({
    name: NAME, // Name of the commenter
    email: EMAIL, // Email address of the commenter
    url: URL, // Web address of the commenter (optional)
    pageId: PAGE_ID, // ID of the relevant post or page
    comment: COMENT // Comment
  }),
  dataType: 'json',
  success: function (url) {
    // Inform the user of the pull request
  },
  error: function () {
    // Tell the user there was an error
  }
});
```

To display the comments you can include something like the following in your template.
```html
<div id="comments">
  {% assign comments = site.data.comments | where: "page_id", page.id | sort: "date" %}

  {% for comment in comments %}
    <div class="comment">
      <div class="comment-author">
        <img src="https://secure.gravatar.com/avatar/{{ comment.mail_hash }}?s=60&d=mp&r=g" alt="{{ comment.name }}">
        <span class="commenter">{{ comment.name }}</span>
      </div>
      <div class="comment-meta">
        <time datetime="{{ comment.date | date_to_xmlschema }}">{{ comment.date | date: "%B %-d, %Y" }}</time>
      </div>
      <div class="comment-content">
        {{ comment.msg | markdownify }}
      </div>
    </div>
  {% endfor %}
</div>
```

### Credits

This code is based on the [jekyll-aws-comments](http://ummels.github.io/jekyll-aws-comments/) project by [ummels](https://github.com/ummels). I made the following changes:
* I changed the location and format of the comments to not require the `comments.rb` plugin. This makes it possible to use it on GitHub Pages which otherwise doesn't work with custom Jekyll plugins.
* I modified the project layout to work with AWS SAM to make deployment much easier. Otherwise setting up all of the pieces in AWS can be tricky.
* I split the code into two lambdas so that the post-comments functions can return to the user more quickly. I did this because creating a GitHub Pull Request can via the API can take several seconds and I didn't want users to wait the entire time for it.

I also borrowed several ideas from [staticman](https://staticman.net/) which is where I first even heard about static comments for a static site. Before this I was using third party to host comments on my static site.
