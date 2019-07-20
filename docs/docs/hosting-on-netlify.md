---
title: Hosting on Netlify
---

In this guide, we'll walk through how to deploy and host your next Gatsby site to [Netlify](https://www.netlify.com/).

Netlify is an excellent option for deploying Gatsby sites. Netlify is a unified platform that automates your code to create performant, easily maintainable sites, and web apps. They provide continuous deployment (Git-triggered builds); an intelligent, global CDN; full DNS (including custom domains); automated HTTPS; asset acceleration; and a lot more.

Their free tier includes unlimited personal and commercial projects, HTTPS, continuous deployment from public or private repositories, and more.

### Hosting Setup

There are two ways you can host your site.

1.) [Upload Site Folder](#upload-site-folder)

2.) [Git Repository Setup](#git-repository-setup)

#### Upload Site Folder

In development mode, if you change the site content or resources, Gatsby won't consume time optimizing the source code. However, for production usage, it is desirable for the site to load as quickly as possible. Gatsby lets you know as much with the message below.

```shell
Note that the development build is not optimized.
To create a production build, use Gatsby build
```

For the production build, you will need to run the `npm run build` command, then Gatsby will generate the production site under the `public` folder. During the build process; CSS, JavaScript, HTML and images will be optimized and placed into this folder.

```shell
npm run build
```

Once the build is complete, you are ready to upload your site to Netlify. Go to [Netlify](https://app.netlify.com/) and login / sign up using any method. After a successful login, you will see the message shown below.

```text
    Want to deploy a new site without connecting to Git?
          Drag and drop your site folder here
```

To start the deploy process, you need only drag and drop the `public` folder over the above area on the Netlify website. Netlify will create a new site with a random name, then start uploading and hosting the application files. After a few moments, it will give you a live site URL eg. `random-name.netlify.com`.

![alt text](./images/gatsby-default-starter.png "Gatsby Default Starter")

#### Git Repository Setup

You can also use git with Netlify to host your website. Netlify currently has built in support for [GitHub](https://github.com/), [GitLab](https://about.gitlab.com/) and [Bitbucket](https://bitbucket.org/). This approach allows you to roll back to past versions of the website whenever you want. You also gain the ability to redeploy the site simply by pushing the code to the respective repository, with no need to manually rebuild and upload every time you make changes. Your repository can be private or public.

Now, login to Netlify and you will see a `New site from git` button at the top right corner of the screen. Click on it and connect with the same git provider that you used to host your website and authorize Netlify to use your account. Choose your website repository and it will take you to deploy settings with the below options.

- Branch to deploy: You can specify a branch to monitor. When you push to that particular branch, only then will Netlify build and deploy the site. The default is `master`.
- Build Command: You can specify the command you want Netlify to run when you push to the above branch. The default is `npm run build`.
- Publish directory: You can specify which folder Netlify should use to host the website. eg. public, dist, build. The default is `public`.
- Advanced build settings: If the site needs environment variables to build, you can specify them by clicking on `Show advanced` and then the `New Variable` button.

Click on the `Deploy site` button and Netlify will start the build and deploy process you have specified. You can go to the `Deploys` tab and see the process unfold in the `Deploy log`. After a few moments, it will give you the live site URL eg. `random-name.netlify.com`.

## Continuous Deployment

Now that the site is connected to your Git repository, Netlify will auto-deploy the site and publish it whenever you push changes to the repository.

### Domain Setup

From the site `Overview`, you can go to `Domain Settings`. By adding a custom domain and setting the `CNAME` record as the Netlify project URL in your DNS provider settings, you should be able to see the Netlify project at your domain URL.

### Other resources

Below are some helpful resources

- [A Step-by-Step Guide: Gatsby on Netlify](https://www.netlify.com/blog/2016/02/24/a-step-by-step-guide-gatsby-on-netlify/)
- [Gatsby Netlify CMS](/packages/gatsby-plugin-netlify-cms)
- [Gatsby + Netlify CMS Starter](https://github.com/netlify-templates/gatsby-starter-netlify-cms)
