---
title: Security for static sites.
date: 2019-03-27
author: Alex Moon
excerpt: "While more secure than their server side counterparts, static sites provide new and unique security concerns."
tags:
  - security
  - api
  - JAMstack
---

Among the many lauded benefits of using a static site generator (i.e. Gatsby) is security. So much so, that in the Gatsby blog there has never been a single post focussed on mitigating security issues. There is not even a doc! This is troubling, because, it creates the myth that there are no security issues to worry about. HINT: You should still be worried about security.

Please understand, there are whole classes of security vulnerabilities that are eliminated by using Gatsby. But, there are still others that are shared and some that are created. You just need to make sure you're aware of those new concerns and how to remedy them. But, what security vulnerabilities exist in Gatsby sites and how do you avoid them?

This article will briefly cover shared security concerns that exist between all flavors of websites. It will then dive deeper on the security concerns unique to static sites.

## Defining Terms

These are not to be considered universal definitions, just how the author will use them going forward.

- **site** - Any website, web-app, or other content you can browse on the internet in a web browser.

- **server-side site** - Any site that renders content on the server, at time of request -- whether using node.js, PHP, Python, or any other method -- before delivering it to the user's browser.

- **client-side site** - Gatsby only generates static sites. Single Page Apps (SPAs) are different but any security issue affecting a pure static site will also affect an SPA. Collectively both methods deliver all needed assets(HTML/CSS/JS) to the client for site rendering.

- **attack vector** - A resource through which to hack a site. Just because an attack vector exists doesn't mean your site is vulnerable to that attack, however. A server is an attack vector; but, the server requires a vulnerability for an attacker to exploit (use) that server as an attack vector.

## Shared Security Concerns

No matter how you deploy your site, how little JavaScript you use, whether it is sever-side or client-side: your site has attack vectors.

When it comes to static sites, if you are going to get hacked, it is going to be at the infastructure level (server/CDN, DNS, CI, etc.) or network level([MitM](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)). Thanks to the cloud, most of this work is done for you and you do not have to secure these layers. As long as you are using two-factor authentication(2FA) and a strong password. You are all using 2FA (when possible) and strong passwords, right!? Good.

Other possible attacks relate to using `iframes` or not removing referrer tags on external links. Thankfully, fixing these is a pretty low bar. This [article](https://blog.sqreen.com/static-websites-security/) covers all these security issues well and includes solutions and deeper discussion.

## Unique Security Concerns

When you ship **everything** to the browser, the user can access **everything**. No amount of minification or obfuscation can hide the code and content you're shipping. If a user knows how to use their browsers dev tools, the user can get that content. This makes showing dynamic or private content on client-side sites seemingly impossible. This is why server-side rendering of sites was invented.

In the server-side world the solution is to...well there is not really a problem to begin with because all the secrets and private content is secured on a server. The client browser never needs to directly access them. The server fetches content from the API or database, and sends back only the content the client is authorized to access.

How do you secure secrets in the client-side world, if all the content and code is being shipped to the client browser? An answer can be found with the "[JAMstack](https://jamstack.org/)". Hopefully you're all fairly familiar with this concept given you're building "JAMstack" sites using Gatsby. For the uninitiated: you use HTML/CSS ([M]arkup) to build your site, [J]avaScript to make it dynamic, and [A]PIs (accessed by JavaScript) to provide content and features. All of this is done from the client-side.

The biggest security struggle with client-side sites is securing those APIs. Most APIs require an API key or another kind of authentication. Simply adding those secrets to the code only further obfuscates access to the same content. It does nothing to actually secure that content.

What's the solution? Well there are several problems to solve.

**Quick Definitions**:

- Private - unique to a person or group of people using your site.
- Public - accessible to any and all users on your site.
- Dynamic - any content that is updated more than once in a 5 minute interval and needs to be accessible to all users of the site.
- Static - any content that changes less than once in a given 5 minute interval.

So, you could have private-static content, private-dynamic content, public-static content, and public-dynamic content. You also need to be aware of whether you are securing the ability to read or write content. Without further delay, in order of difficulty...

### Public Static Content

This is by far the most common and simplest content to secure. This makes up the content of your marketing site, public blog, etc. In a Gatsby site, this content can be added statically via HTML or dynamically at build time via a [source plugin](/docs/source-plugin-tutorial/). Whatever source platform you use, whether it be a GitHub repository or a headless CMS, that platform is charged with securing your content from unauthorized reads and writes.

If you are using a headless CMS, the static content is fetched at build time and Gatsby will need api key to do so. For example, [gatsby-source-contentful](https://www.gatsbyjs.org/packages/gatsby-source-contentful/?=contentful) requires an `accessToken`. While this is a 'read-only' token, exposing it to the public would mean anyone could take your structured data and use it any way they want.

Fortunately, this is an easy fix using [environment variables](https://www.gatsbyjs.org/docs/environment-variables/). This means not committing your `accessToken` to the git repository for all the world to read. Instead it is stored securely on the build server and your Contentful config reads like this:

```js:title=gatsby-config.js
{
  resolve: `gatsby-source-contentful`,
  options: {
    spaceId: `your_space_id`,
    // Learn about environment variables: https://gatsby.dev/env-vars
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  },
},
```

**Remember**: Never store secure access tokens, API keys, or passwords in your code.

### Private Content

Private content, whether dynamic or static, is another solution and is well documented in Gatsby's [authentication tutorial](/docs/authentication-tutorial/#security-notice).

**TL;DR:** Authenticate users using JSON Web Tokens(JWTs) and dynamically render pages only to authorized users. Any API calls that need to be made in order to fetch content can use the user's JWT and be verified by the API. If you need to access a third party API, any API Keys can be stored securely by your API which is securely authenticated to using the JWT.

This is pretty much the base of the "JAMstack" and allows for private content in client-side sites. Requiring user authentication will cover all use cases involving private data and will also help in situations where data is read publicly but written by authenticated users (e.g. CMS backend or comments section).

### Public Dynamic Content

This should be easy right? It is public content after all. But, if you need anonymous users to be able to both read and write this data, you should be concerned. Content read publicly, but written privately, was covered in the previous section. Admittedly, public reading and writing of content is less common.

Medium's "clap" feature, up-voting on Hacker News or Reddit, liking something on Facebook or Twitter, these all require authentication. Even public APIs like GitHub's requite authentication or sites like wikipedia. Even if anyone in the world can create an account and access these tools.

Why address this scenario? Two reasons:

- **Simplicity** - Consider a small blog or non-profit site where authentication is not already needed. To develop it would require a lot of time and long term investment. For users authenticating to small blog just to hit "like" is bad user experience and is probably a hurtle they will not bother jumping.

- **Privacy** - No matter the size of your platform, requiring user to authenticate means having to secure private data. This requires time and money. Alternatively, as a platform, you may decide your users' privacy is more important.

Using Medium's "clap" feature as example, what are the issues? First, we need some kind of database to store the claps. This is easy enough, but do we leave no security mechanism on this database for reads and writes? We could add security, but then the API key we need has to be shipped in the code and the user can access it. Either way, your more nefarious users could access this database; reading and (more importantly) writing to their devious heart's content.

There is a small blog that does this very thing. They build the Firebase credentials into the code at build time. Because this is a small blog, and their is no real incentive for someone to add or delete claps, this blogger is probably safe. What is the worse case scenario? Someone deletes their claps? Gives all their posts a million claps? Maybe this is defeating the point of a security post. But security is bout threat assessment. This blogger is clearly not worried about a nation state hacking their claps or someone gaming a system. Nothing but authentication is going to solve those kinds of issues.

Assuming Russia is not trying to hack you and you would like to better secure your claps, what are you options? You need an API.

That sounds hard? Go checkout Netlify, They will provide great static hosting and allow you to deploy serverless functions right along side your static site. They are not the only ones, Azure, Google, Amazon, Zeit.co, and others all have solutions.

What does this API allow? First, you can secure your database. Any API keys can be secured on your serverless...server 😭. The point is, they will be secure. But what does this gain you? After all, instead of pillaging your database directly you have given them an API through which to pillage.

Control, you have gained the ability to add rate limiting, better logging, auto blocking of IPs, etc. You can throw the proverbial "secure API handbook" (except for the authentication part) at your users to make sure they behave. More aggressively, you could use a secure cookie for your site to uniquely and anonymously identify each user. This would assist in the previously mentioned security practices and, while not hard to delete a cookie, adds another layer of security.

In the end if you need hardened security, you need authentication. If you want a simpler solution for simpler features, these suggestions might just help. Remember, if you need access a database and you already have authentication, do not ship those secure API keys to the client!

### Exceptions

Every good rule has its exceptions. Never shipping API keys in client-side code is no exception. Let me be clear, you should never ship **SECURE** API keys (often called secrets) to a client. But, there is such a thing as non-secure/public API keys. These keys are generally used for identification and not for access control. Firebase authentication is a great example of this.

Your site needs to be able to access your unique Firebase instance, to authenticate users. To do this, Firebase uses an API key to identify your app. This key is [designed to be public](https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public) and their documentation tells you to add it to your client-side code. [Firebase has other controls](https://stackoverflow.com/questions/35418143/how-to-restrict-firebase-data-modification) that determine what an anonymous user is allowed to do with this key.

This is also the case with Cloudinary. While they have a private API key (a secret) required to access private content, they also require an API key for [anonymous uploads](https://cloudinary.com/documentation/upload_images#unsigned_upload). This key is designed to be public and is used as a unique identifier of your cloud instance and not as a security measure.

It can difficult to know whether an API key should be kept secret. If the page giving you the keys does not specify, check the docs. If all else fails use a search engine: someone on Stack Overflow has likely already asked.

## Conclusion

Remember, keep it **secret**, keep it **safe**! Do not store API keys in your repository and do not ship them in your client-side code. 

Now go make awesome Gatsby sites that are completely secure!

**Disclaimer**: The author does not claim to be a security expert. He is a developer who cares about security and has some experience. This post might contain incomplete or innaccurate information. It is your responsibility to properly secure your sites.
