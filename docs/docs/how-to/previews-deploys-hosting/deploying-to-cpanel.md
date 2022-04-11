---
title: Deploying to cPanel
---

This step-by-step guide walks through how to deploy and host your next Gatsby site on [cPanel](https://www.cpanel.net/).

**cPanel** is an _web hosting control panel_ made by **cPanel**.

**Gatsby** is an _open-source static site generator_. Examples of use cases like _making a website which is not frequently updated, for example, it is good for an like CV, but not for like a blog which like for example be updated twice a week!_

<ins>**Quick note**</ins>: _In this step-by-step guide, we have 2 methods for deploying, **without Git** and **with GitHub**_

## Without Git

If you're new to **Git** and don't have time learning **Git** _basics_, this method is the **best** for you!

For start, go into your project directory and execute the following command in the terminal:

`gatsby build`

`gatsby build` should create a new `public` directory in your project. In `public`, their should be all the file and code needed to deploy your **Gatsby** site!

When `gatsby build` has done been executing, run the next command below:

`gatsby serve`

<ins>**Quick note for macOS users**</ins>: _To terminate the `serve` process, you can do that by typing `^C` (control + c)_

Now, we will start the deploying to **cPanel**.

Login into **cPanel**... Go to file manager, search for `public_html` directory. Delete everything in `public_html` (_if you don't need it for your new site_), and click on **Upload**! Upload all the `public` directory content, (_which has been created using the `gatsby build` command_). Just make sure, all files are directly in the `public_html` dir, not any sub-folder!

That's it for this method, if you have a domain linked to your account, the website will be _online_!

## Using GitHub

Now, we will use **GitHub** to deploy. The above method works fine, but what's annoying, _each time you change a small detail in your site, you should upload `public` again_!

**GitHub** is the solution!

First of all, be sure to include `.cpanel.yml` in your project directory.

Be sure `.cpanel.yml` look like this:

```yml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/userName/public_html/
    - /bin/cp -R public/* $DEPLOYPATH
```

Replace `userName` in `DEPLOYPATH` with your **cPanel** _username_.

Open your termanal, run the `gatsby build` command to create the `public` folder,  then push it to your repo. To check the build files, use `gatsby serve`.

Once your fancy **GitHub** repo is ready, go to **cPanel** and click **Git Version Control**. Click on **Create** and paste your **GitHub Repo** clone URL.

Now choose where the repo should be stored, it doesn't really matter where do you store it 😀.

Next, choose repo name, click now **Create**. Be sure `public_html` folder is empty! Go backe to **Git Version Control Panel** and click **Manage** next your repo name, go to **Pull or Deploy**, click **Update from Remote**, then **Deploy HEAD commit**.

That's it again for this method!

Have a good experience using **Gatsby**!

## Other recourses

- [A Step-by-Step Guide: Gatsby on Netlify](https://www.netlify.com/blog/2016/02/24/a-step-by-step-guide-gatsby-on-netlify/)
- [Deploying to Firebase Hosting](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-firebase/)
- [Add a Plugin to Your Site](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/using-a-plugin-in-your-site/)
- [Gatsby + Netlify CMS Starter](https://github.com/netlify-templates/gatsby-starter-netlify-cms)
