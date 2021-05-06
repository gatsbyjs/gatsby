---
title: Preparing a Site for Deployment
---

## Create new Gatsby project

First thing you need to do is generate and configure your new Gatsby project.
If you haven't already [set up a Gatsby project](/docs/quick-start) you can do so by first installing Gatsby globally:

```shell
npm install --global gatsby-cli
```

Then generate a project with the following command:

```shell
gatsby new your-new-project
```

Finally, change into the new site directory:

```shell
cd your-new-project
```

## Generate your site

To generate static files in the simplest way, write

```shell
gatsby build
```

Then in the `public` directory will be files to copy to the server.

## Adding a path prefix

If you want a specific Path Prefix, for example `example.com/blog/` instead of `example.com/` read [adding a path prefix](/docs/how-to/previews-deploys-hosting/path-prefix)

## Specific deploy

Additional actions may be required depending on which server you use.
If you have a server from one of the following providers, you should read the individual subpages:

- [AWS Amplify](/docs/how-to/previews-deploys-hosting/deploying-to-aws-amplify)
- [S3/CloudFront](/docs/how-to/previews-deploys-hosting/deploying-to-s3-cloudfront)
- [Aerobatic](/docs/deploying-to-aerobatic)
- [Heroku](/docs/how-to/previews-deploys-hosting/deploying-to-heroku)
- [Vercel](/docs/how-to/previews-deploys-hosting/deploying-to-vercel)
- [Cloudflare Workers](/docs/deploying-to-cloudflare-workers)
- [GitLab Pages](/docs/deploying-to-gitlab-pages)
- [Netlify](/docs/how-to/previews-deploys-hosting/deploying-to-netlify)
- [Render](/docs/deploying-to-render)
- [Surge](/docs/deploying-to-surge)
- [GitHub Pages](/docs/how-to/previews-deploys-hosting/how-gatsby-works-with-github-pages)
- [Microsoft Internet Information Server (IIS)](/docs/deploying-to-iis)
- [Firebase Hosting](/docs/how-to/previews-deploys-hosting/deploying-to-firebase)
- [KintoHub](/docs/deploying-to-kintohub)
- [21YunBox](/docs/how-to/previews-deploys-hosting/deploying-to-21yunbox)

If you don't see the hosting you are interested, it's possible to add other hosting providers through [contributions to the docs](/contributing/docs-contributions).
