---
title: Hosting on Netlify
---

In this guide, we'll walk through how to deploy and host your next Gatsby site to [Netlify](https://www.netlify.com/).

Netlify is an excellent option for deploying Gatsby sites. Netlify is a unified platform that automates your code to create performant, easily maintainable sites, and web apps. They provide continuous deployment (Git-triggered builds); an intelligent, global CDN; full DNS (including custom domains); automated HTTPS; asset acceleration; and a lot more.

Their free tier includes unlimited personal and commercial projects, HTTPS, continuous deployment from public or private repos and more.

### Hosting Setup

There are two ways we can host our site.

1.) [Upload Site Folder](#upload-site-folder)

2.) [Git Repository Setup](#git-repository-setup)

#### Upload Site Folder

In Gatsby development mode, when we change our site content or resources, Gatsby won't consume our time to optimize the source code. However, for production usage, we want our site to load as quickly as possible. Gatsby lets us know as much with the message below.

```shell
Note that the development build is not optimized.
To create a production build, use Gatsby build
```

For the production build, we will need to run the `npm run build` command, then Gatsby will generate our production site under the `public` folder. During the build process; CSS, JavaScript, HTML and images will be optimized and placed into this folder.

```shell
npm run build
```

Once the build is complete, we are ready to upload our site to Netlify. Go to [Netlify](https://app.netlify.com/) and login / sign up using any method. We will see the below message after a successful login.

```
    Want to deploy a new site without connecting to Git?
          Drag and drop your site folder here
```

To start the deploy process, we need only drag and drop our `public` folder over the above area on the Netlify website. Netlify will create a new site with a random name, then start uploading and hosting our files. After a few moments, it will give us our live site URL eg. `random-name.netlify.com`.

![alt text](./images/gatsby-default-starter.png "Gatsby Default Starter")

#### Git Repository Setup

We can also use git with Netlify to host our website. Netlify currently has built in support for [GitHub](https://github.com/), [GitLab](https://about.gitlab.com/) and [Bitbucket](https://bitbucket.org/). This approach allows us to roll back to past versions of our website whenever we want. We also gain the ability to redeploy our site simply by pushing our code to the respective repository, with no need to manually rebuild and upload every time we make changes. Our repository can be private or public.

Now, login to Netlify and we will see a `New site from git` button at the top right corner of our screen. Click on it and connect with the same git provider that you used to host your website and authorize Netlify to use your account. Choose your website repository and it will take you to deploy settings with the below options.

- Branch to deploy: We can specify a branch to monitor. When we push to that particular branch, only then will Netlify build and deploy our site. The default branch is `master`.
- Build Command: We can specify the command we want Netlify to run when we push to the above branch. The default is `npm run build`.
- Publish directory: We can specify which folder Netlify should use to host our website. eg. public, dist, build. The default is `public`.
- Advanced build settings: If our site needs environment variables to build, we can specify them by clicking on `Show advanced` and then the `New Variable` button.

Click on the `Deploy site` button and Netlify will start the build and deploy process we previously specified. We can go to the `Deploys` tab and see what is actually happening in the `Deploy log`. After a few moments, it will give us our live site URL eg. `random-name.netlify.com`.

## Continuous Deployment

Now that your site is connected to your repository, Netlify will auto-deploy the site and publish it whenever you push to your Git repo.

### Domain Setup

From our site `Overview`, we can go to `Domain Settings`. By adding our own domain and setting the `CNAME` record as our Netlify project URL in your DNS provider settings, we should be able to see our Netlify project at our domain URL.

### Other resources

Below are some helpful resources

- [A Step-by-Step Guide: Gatsby on Netlify](https://www.netlify.com/blog/2016/02/24/a-step-by-step-guide-gatsby-on-netlify/)
- [Gatsby Netlify CMS](/packages/gatsby-plugin-netlify-cms)
- [Gatsby + Netlify CMS Starter](https://github.com/netlify-templates/gatsby-starter-netlify-cms)
