---
title: Hosting on Netlify
---

In this guide, we'll walk through how to deploy & host your next Gatsby site to [Netlify](https://www.netlify.com/).

Netlify is an excellent option for deploying Gatsby sites. Netlify is a unified platform that automates your code to create high-performant, easily maintainable sites, and web apps. They provide continuous deployment (Git-triggered builds), an intelligent, global CDN, full DNS (including custom domains), automated HTTPS, asset acceleration, and a lot more.

Their free tier includes unlimited personal and commercial projects, HTTPS, continuous deployment from public or private repos and more.

### Hosting Setup

There are two ways, we can host our site.

1.) [Upload Site Folder](#upload-site-folder)

2.) [Git Repository Setup](#git-repository-setup)

#### Upload Site Folder

In Gatsby development mode, we constantly change content, add images, so Gatsby won't consume our time to optimize the source code as we are currently developing our site. For production usage, we want our site to load as fast as possible. Gatsby also informs us about it with below message.

```shell
Note that the development build is not optimized.
To create a production build, use Gatsby build
```

For the production build, we will need to run the `npm run build` command and Gatsby will generate our production site under `public` folder, it will contain CSS, JavaScript, images and HTML files.

```shell
npm run build
```

Once, the build is complete, we are ready to upload our site to Netlify. Go to [Netlify](https://app.netlify.com/) and login in/sign up using any method. We will see below message after successful login.

```
    Want to deploy a new site without connecting to Git?
          Drag and drop your site folder here
```

As written on the website, we only need to drag and drop our `public` folder over above area on Netlify website. Netlify will create a new site with a random name, start uploading and hosting our files. In a few moments, it will give us our site URL like `random-name.netlify.com`.

![alt text](./images/gatsby-default-starter.png "Gatsby Default Starter")

#### Git Repository Setup

We can use git with Netlify to host our website. There are many benefits of this such as we can have past versions of our website so that we can rollback to previous versions whenever we want, no need to manually build our website and upload it every time we change anything. Netlify supports [GitHub](https://github.com/), [GitLab](https://about.gitlab.com/) and [Bitbucket](https://bitbucket.org/). All we have to do is push our code to the respective repository. Our repository can be private or public.

Now, login to Netlify and we will see a `New site from git` button at the top right corner on our screen. Click on it and connect with the same git provider that you used to host your website and authorize Netlify to use your account. Choose your website repository and it will take you to deploy settings with below options.

- Branch to deploy: We can specify the branch, when we push to that particular branch, then only Netlify will build and deploy our site. The default is `master`.
- Build Command: We can specify the command we want Netlify to run when we push to above branch. The default is `npm run build`.
- Publish directory: We can specify which folder should Netlify use to host our website. eg. public, dist, build. The default is `public`.
- Advanced build settings: If our site needs environment variables to build, we can spectify them by clicking on `Show advanced` and then the `New Variable` button.

Click on `Deploy site` button and Netlify will start to build and deploy process we specified. In a few moments, it will give us our site URL like `random-name.netlify.com`. We can go to the `Deploys` tab and see what is actually happening.

## Continuous Deployment

Now that your site is connected to your repository, Netlify will auto-deploy the site and publish it whenever you push to your Git repo.

### Domain Setup

In Domain Settings, we can add our own domain and set `CNAME` record as our Netlify project URL in your DNS provider settings. Now we should be able to see our Netlify project at our domain URL.

### Other resources

Below are some helpful resources

- [A Step-by-Step Guide: Gatsby on Netlify](https://www.netlify.com/blog/2016/02/24/a-step-by-step-guide-gatsby-on-netlify/)
- [Gatsby Netlify CMS](/packages/gatsby-plugin-netlify-cms)
- [Gatsby + Netlify CMS Starter](https://github.com/netlify-templates/gatsby-starter-netlify-cms)
