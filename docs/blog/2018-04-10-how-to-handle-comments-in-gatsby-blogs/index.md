---
title: How to handle comments in Gatsby blogs
date: "2018-04-09"
author: "Gatsby Central"
canonicalLink: https://www.gatsbycentral.com/how-to-handle-comments-in-gatsby-blogs
publishedAt: "Gatsby Central"
---

> tl;dr Hosted services like disqus are the easiest. Staticman is the best option, but requires some setup.

You have a static site. Or you will have. You understand how the content will work. But what about comments?

You have three choices.

* Keep comments in git.
* Use client side comment service.
* Do something crazy.

## Client side

The second is the simplest choice. [Disqus](https://disqus.com/) is a popular client side comment service. They offer a free tier for non-commercial sites. Or plans start from $10/month.

There are also open source alternatives like [commento](https://github.com/adtac/commento). You need to install them. You need to manage and maintain a server. This is probably too much work to be worthwhile.

How do they work? You insert a javascript tag. That loads the comment service. It inserts the comments **client side**. This means your comments are not part of your Gatsby output. This means Google probably won't see them.

## Comments in git

Putting the comments inside git is awesome. Your content, your site, no external dependencies. Fantastic.

### Staticman

But how do you get them there? Enter [staticman](https://staticman.net/). You give staticman access to your GitHub repo. You create a form. Staticman creates a pull request. It also supports akismet spam filtering. Genius. Oh, and it's free. Yes, doubly fantastic.

Staticman is open source. You can run your own instance. If you really want to. It's probably not worth it. Their service is free. They don't "own" your data. If they disappear, your comments live on.

### Roll your own

You could create your own staticman alternative. You could use a framework like [serverless](https://serverless.com/). You can find free hosts for serverless. You can write your own custom anti spam logic. This will be hard. It will probably be fun. It's not a very good idea!

### Netlify

Are you hosting on [netlify](https://serverless.com/)? Then you could use their forms service. If you pay for netlify, you can link forms to functions. Similar to serverless. You could use that to make PRs. Or push content to GitHub. Or other git hosts. Too complicated. Not worth it.

### Email

You could link your comment form to an email address. Then you could copy and paste comments into git. Manual comment moderation. Maybe with netlify's form service? Or a serverless setup. Again, this could be fun to setup. Again, it's probably not a very good idea!

## Crazy

There are many other options. Some crazier than others. You could push comments to WordPress. Then pull them from WordPress into Gatsby at build time. Or push them to a headless CMS. Via a serverless setup maybe.

You could create a comment form. Then have it generate a mailto link. Then people email you the comment. Then you copy and paste it into git. Or the mailto link points to a service like mailgun. Then incoming emails turn into webhooks. Then forward to serverless. Then land as pull requests.

The possibilities are limitless.

## Conclusion

Use [staticman](https://staticman.net/). It's the best all round option. Keep control of your content. If their service goes down, you keep your comments. You can run your own instance later if necessary. It includes support for akismet spam filtering.

**To see staticman in action, leave a comment at [Gatsby Central](https://www.gatsbycentral.com)!**
