---
title: Security for Modern Web Frameworks.
date: 2019-04-06
author: Alex Moon
excerpt: "While more secure than their server-side counterparts, modern web frameworks provide new and unique security concerns."
tags:
  - security
  - apis
  - jamstack
---

Among the many lauded benefits of using Gatsby (and other static app frameworks) is security. It is encouraging to see a framework not require developers to stress about security, but for those new to Gatsby or web development, this can contribute to a myth that there are no security issues.

There are indeed whole classes of security vulnerabilities that are eliminated by using Gatsby for web development; but there are still other vulnerabilities that are shared and some that are created. As a Gatsby developer, you need to make sure you are aware of these possible vulnerabilities and how to remedy them.

This post will act as an introduction to get you familiar with these concepts in Gatsby.

## Defining Terms

These are not to be considered universal definitions, just how the author will use them going forward.

- **site** - Any website, web-app, or other content you can browse on the internet in a web browser.

- **server-side site** - Any site that pre-processes code at time of request -- whether using node.js, PHP, Python, or any other method -- before delivering it to the user's browser.

- **client-side site** - Any site (GatsbyJS, NuxtJS, NextJS, Single Page App, etc...) where static files(HTML/CSS/JS) are shipped to the browser for processing -- pre-processing may happen at build time, but does not happen time of request.

- **attack vector** - A resource through which to hack a site. Just because an attack vector exists does not mean your site is vulnerable to that attack, however. A server is an attack vector; but, the server requires a vulnerability for an attacker to exploit (use) that server as an attack vector.

## Shared Security Concerns

No matter how you deploy your site, how little JavaScript you use, whether it is sever-side or client-side: your site has attack vectors.

When it comes to client-side sites, if you are going to get hacked, it is likely going to be at the infrastructure or network level:

- **Infrastructure** - This might be your CDN, code repository, DNS, CI, etc. Thanks to the cloud, most of the work securing this layer is done for you. As long as, you are using two-factor authentication (2FA) and a strong password. You are all using 2FA (when possible) and strong passwords, right!? Good.

- **Network** - This kind of attack happens when an attacker can access to the network being used to access your site. It could be a rouge third-party in your cloud provider, or someone sitting across the coffee shop on the same public WiFi as your user. The exact attack methods vary, but are collectively referred to as a [Man-in-the-Middle](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) attack.
  The defense here is HTTPS (TLS encryption). Other related technologies such as [Cross-Origin-Resource-Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), [Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security), [Public Key Pinning](*https://developer.mozilla.org/en-US/docs/Web/HTTP/Public_Key_Pinning), and [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) all assist in securing network traffic. No matter who is looking at your network traffic, they can not read or modify it.

Other possible attacks relate to using `iframes` without securing them or not removing referrer tags on external links. Thankfully, fixing these is a pretty low bar. More on this later.

## Unique Security Concerns

When you ship **everything** to the browser, the user can access **everything**. No amount of minification or obfuscation can hide the code and content you are shipping. If a user knows how to use their browser's dev tools, the user can get that content. This makes showing dynamic or private content on client-side sites seemingly impossible. This is why server-side rendering of sites was invented.

In the server-side world the solution is to...well there is not really a problem to begin with because all the secrets and private content is secured on a server. The client browser never needs to directly access them. The server fetches content from the API or database, and sends back only the content the client is authorized to access.

How do you secure secrets in the client-side world, if all the content and code is being shipped to the client browser? An answer can be found with the "[JAMstack](https://jamstack.org/)". Hopefully you are all fairly familiar with this concept given you are building "JAMstack" sites using Gatsby. For the uninitiated: you use HTML/CSS ([M]arkup) to build your site, [J]avaScript to make it dynamic, and [A]PIs to provide content and features. All of this is done from the client-side.

The biggest security struggle with client-side sites is securing those APIs. Most APIs require an API key or another kind of authentication. Simply adding those secrets to the code only further obfuscates access to the same content. It does nothing to actually secure that content.

What's the solution? Well there are several problems to solve.

**Quick Definitions**:

- **Private** - unique to a person or group of people using your site.
- **Public** - accessible to any and all users on your site.
- **Dynamic** - any content that is updated more than once in a 5 minute interval and needs to be accessible to all users of the site.
- **Static** - any content that changes less than once in a given 5 minute interval.

NOTE: 5 minutes is somewhat arbitrary. 5 minutes is used because anything changed **less often** generally just means rebuilding and deploying your site with an automated CI/CD pipeline. Build times make anything changed **more often** tricky. This build time problem is a core tenant of [Gatsby](https://www.gatsbyjs.com/) and future features (like [incremental builds](https://github.com/gatsbyjs/gatsby/issues/5002)) that will speed up build times significantly.

So, you could have private-static content, private-dynamic content, public-static content, and public-dynamic content. You also need to be aware of whether you are securing the ability to read or write content. Without further delay, in order of difficulty...

### Public Static Content

This is by far the most common and simplest content to secure. This makes up the content of your marketing site, public blog, etc. In a Gatsby site, this content can be added statically via HTML or dynamically at build time via a [source plugin](/docs/creating-a-source-plugin/). Whatever source platform you use, whether it be a GitHub repository or a headless CMS, that platform is charged with securing your content from unauthorized reads and writes.

If you are using a headless CMS, the static content is fetched at build time and Gatsby will need an API key to do so. For example, [gatsby-source-contentful](/packages/gatsby-source-contentful/?=contentful) requires an `accessToken`. While this is a 'read-only' token, exposing it in your code would mean anyone with access to your code repository could take your structured data and use it any way they want.

Fortunately, this is an easy fix using [environment variables](/docs/environment-variables/). This means not committing your `accessToken` to the git repository where many can possibly access it. Instead it is stored securely on the build server and your Contentful config reads like this:

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

Private content, whether dynamic or static, is another solution and is well documented in Gatsby's [authentication tutorial](/tutorial/authentication-tutorial/#security-notice).

**TL;DR:** Authenticate users using JSON Web Tokens(JWTs) and dynamically render pages only to authorized users. Any API calls that need to be made in order to fetch content can use the user's JWT and be verified by the API. If you need to access a third party API, any API keys can be stored securely by your API which is securely authenticated to using the JWT.

This is pretty much the base of the "JAMstack" and allows for private content in client-side sites. Requiring user authentication will cover all use cases involving private data and will also help in situations where data is read publicly but written by authenticated users (e.g. CMS backend or a comments section).

### Public Dynamic Content

This should be easy right? It is public content after all. But, if you need anonymous users to be able to both read and write this data, you should be concerned. Content read publicly, but written privately, was covered in the previous section. Admittedly, public reading and writing of content is less common.

Medium's "clap" feature, up-voting on Hacker News or Reddit, liking something on Facebook or Twitter; these interactions all require authentication. Even public APIs like GitHub's and sites like Wikipedia require authentication; even if anyone in the world can create an account and access these tools.

Why address this scenario? Two reasons:

- **Simplicity** - Consider a small blog or non-profit site where authentication is not already needed. To develop it would require a lot of time and long term investment. Users authenticating to a small blog just to hit "like" is a poor user experience and probably a hurtle they will not bother jumping.

- **Privacy** - No matter the size of your platform, requiring users to authenticate means having to secure private data: this requires time and money. Alternatively, as a platform, you may decide your users' privacy is more important then better security controls.

Using Medium's "clap" feature as example, what are the security issues? First, we would need some kind of database to store the claps. Do we leave no security mechanism on this database for reads and writes? We could add security, but then the necessary API key has to be shipped in the code and the user can access it. Either way, your more nefarious users could access this database; reading and (more importantly) writing to their devious heart's content.

There is a small blog that does this very thing. They build the Firebase credentials into the code at build time. Because this is a small blog, and there is no real incentive for someone to add or delete claps, this blogger is probably safe. What is the worse case scenario? Someone deletes their claps? Gives all their posts a million claps? Maybe this is defeating the point of a security post. But security is about threat assessment. This blogger is not worried about a nation state hacking their claps or someone gaming the system. Nothing but secure authentication is going to solve those kinds of issues.

Assuming a nation state is not trying to attack you, what are you options for better security? You need an API.

One great option is to check out Netlify. They will provide great static hosting and allow you to deploy serverless functions right along side your Gatsby site. They are not the only ones: Azure, Google, Amazon, Zeit.co, and others all have API solutions.

What does this API allow? First, you can secure your database. Any API keys can be secured on your serverless...server 😭. The point is, they will be secure. But what does this gain you? After all, instead of pillaging your database directly you have given them an API through which to pillage.

**Control:** You have gained the ability to add rate limiting, logging, auto blocking of IPs, etc. You can use every API security best practice there is (except for authentication) to make sure your API is not abused. More aggressively, you could use a secure cookie for your site to uniquely and anonymously identify each user. This would assist in the previously mentioned security practices and, while not hard for a user to delete a cookie, it adds another layer of security.

In the end if you need hardened security, you need authentication. If you want a simpler solution for basic features, these suggestions might just help. Remember, if you need access to a database and you already have authentication, do not ship those secure API keys in the client-side code!

### Exceptions

Every good rule has its exceptions. Never shipping API keys in client-side code is no exception. To be clear, you should never ship **SECURE** API keys (often called secrets) to a client. But, there is such a thing as non-secure/public API keys. These keys are generally used for identification and not for access control. Firebase authentication is a great example of this.

Your site needs to be able to access your unique Firebase instance to authenticate users. To do this, Firebase uses an API key to identify your app. This key is [designed to be public](https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public) and their documentation tells you to add it to your client-side code. [Firebase has other controls](https://stackoverflow.com/questions/35418143/how-to-restrict-firebase-data-modification) that determine what an anonymous user is allowed to do with this key.

This is also the case with Cloudinary. While they have a private API key (a secret) required to access private content, they also require an API key for [anonymous uploads](https://cloudinary.com/documentation/upload_images#unsigned_upload). This key is designed to be public and is used as a unique identifier of your cloud instance and not as a security measure.

It can difficult to know whether an API key should be kept secret. If the page giving you the keys does not specify, check the docs. If all else fails use a search engine: someone on Stack Overflow has likely already asked.

## Conclusion

Remember, keep it **secret**, keep it **safe** 🧙🏼‍! Do not store API keys in your repository and do not ship them in your client-side code.

Now go make awesome Gatsby sites that are completely secure! For more information on web security checkout these resources:

- **General web-app security**: The [OWASP Top Ten](https://www.owasp.org/index.php/Category:OWASP_Top_Ten_Project) is a list of top website security vulnerabilities. The [Open Web Application Security Project](https://www.owasp.org/index.php/Main_Page) is a excellent resource for security.

* **Shared Security**: The article "[Security for Static Websites](https://blog.sqreen.com/static-websites-security/)" covers shared security issues well and includes complete solutions.

- **Secure APIs**: For information on securing all APIs (authenticated or not) checkout the [Rest Secutiry Cheat Sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/REST_Security_Cheat_Sheet.md) from OWASP.

- **[Gatsby Authentication Tutorial](/tutorial/authentication-tutorial/#security-notice)**

**Disclaimer**: The author does not claim to be a security expert. He is a developer who cares about security and has some experience. This post might contain incomplete or inaccurate information. It is your responsibility to properly secure your sites.
