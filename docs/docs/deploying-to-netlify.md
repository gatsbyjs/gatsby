---
title: Deploying to Netlify
---

In this guide, we'll walk through how to host & publish your next Gatsby site to [Netlify](https://www.netlify.com/).

Netlify is an excellent option for deploying Gatsby sites. Netlify is a unified
platform that automates your code to create high-performant, easily maintainable
sites and web apps. They provide continuous deployment (Git-triggered builds),
an intelligent, global CDN, full DNS (including custom domains), automated
HTTPS, asset acceleration, and a lot more.

Their free tier includes unlimited personal and commercial projects, HTTPS,
continuous deployment from public or private repos and more.

**NOTE**: There is no need to build the site, Netlify can handle that for us.

## Getting Started - Netlify

Now, that the Gatsby site is running, we need to upload your Gatsby site to [GitHub](https://github.com/), [GitLab](https://about.gitlab.com/) or [Bitbucket](https://bitbucket.org/).

Now, go to Netlify and signup if you haven't already.
We connect to GitHub (or GitLab/Bitbucket) and select the repository.

We can change how Netlify builds and deploys the site.
If we change nothing, Netlify will build the `master` branch of the repository and will invoke the build command after we clicked deploy.
If you would have previously built the site and pushed the build to Git, Netlify would publish the directory selected (`/public`).

After Netlify now finished the build, we can see the website on the given url.

## Continuous Deployment

Now that your site is connected to your repository, Netlify will deploy the site and publish it whenever you push to your Git repo.

## References

- [Introduction to Gatsby](/blog/2017-05-31-introduction-to-gatsby/#deployment)
- [Escalade Sports: From $5000 to \$5/month in Hosting With Gatsby](/blog/2018-06-14-escalade-sports-from-5000-to-5-in-hosting/)
- [Why I created my blog with Gatsby and Contentful](/blog/2017-11-09-why-i-created-my-blog-with-gatsby-and-contentful/#hosting-with-netlify)
- [Gatsby + Contentful + Netlify (and Algolia)](/blog/2017-12-06-gatsby-plus-contentful-plus-netlify/#solution-netlify--gatsby)
- More [blog posts on Gatsby + Netlify](/blog/tags/netlify)
