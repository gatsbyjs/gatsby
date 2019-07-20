---
title: Making a Gatsby Blog with Netlify CMS
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/JeTqxCJC56Q" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="YouTube video: Make a developer blog in under 10 minutes | Lightning Tutorial"></iframe>

This tutorial will use [gatsby-personal-starter-blog](http://t.wang.sh/gatsby-personal-starter-blog), a Gatsby starter based on the official [gatsby-starter-blog](/starters/gatsbyjs/gatsby-starter-blog/). The differences are that `gatsby-personal-starter-blog` is configured to run the blog on a subdirectory, `/blog`, and comes pre-installed with [Netlify CMS](https://www.netlifycms.org/) for content editing. It also adds VS Code highlighting for code blocks.

## Prerequisites

- A GitHub account
- The [Gatsby CLI](/docs/gatsby-cli) installed

## Set up a Netlify CMS-managed Gatsby site in 5 steps:

### Step 1

Open your Terminal and run the following command from the Gatsby CLI to create a new Gatsby site using [gatsby-personal-starter-blog](http://t.wang.sh/gatsby-personal-starter-blog).

```sh
gatsby new [your-project-name] https://github.com/thomaswangio/gatsby-personal-starter-blog
```

### Step 2

Once the Gatsby site is finished installing all the packages and dependencies, you can now go into the directory and run the site locally.

```sh
cd [your-project-name]
gatsby develop
```

Now you can go to [`localhost:8000`](http://localhost:8000) to see your new site, but what's extra cool is that Netlify CMS is pre-installed and you can access it at [`localhost:8000/admin`](http://localhost:8000/admin).

A CMS, or content management system, is useful because you can add content like blog posts from a dashboard on your site, instead of having to add posts manually with Markdown. However, you'll likely want to be able to access the CMS from a deployed website, not just locally. For that, you'll need to deploy to Netlify through GitHub, set up continuous deployment, and do a few configurations.

### Step 3

Open the project in your code editor and open `static/admin/config.yml`. Replace `your-username/your-repo-name` with your GitHub username and repo.

```diff
backend:
-  name: test-repo

+  name: github
+  repo: your-username/your-repo-name
```

#### Customizing your site

You'll likely also want to edit the `README.md` and `package.json` files to include your own project details.

Head into `gatsby-config.js` and you can edit your siteMedata, add a Google Analytics tracking ID, and your app icon/favicon. Test out the edits for the deployed build by quitting the development server and running `gatsby build && gatsby serve`.

### Step 4

To make sure that Netlify CMS has access to your GitHub repo, you need to set up an OAuth application on GitHub. The instructions for that are here: [https://www.netlify.com/docs/authentication-providers/#using-an-authentication-provider](https://www.netlify.com/docs/authentication-providers/#using-an-authentication-provider). Once you've configured an authentication provider then you'll be able to use Netlify CMS at your deployed site to add new posts.

![Netlify and GitHub Authorization](https://cdn.netlify.com/67edd5b656c432888d736cd40125cb61376905bb/c1cba/img/docs/github-oauth-config.png)

### Step 5

Open [github.com](http://github.com) and create a new repository, with the same name as your project. Push your new Gatsby site's code to GitHub using the following Terminal commands:

```sh
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/[your-username]/[your-repo-name].git
git push -u origin master
```

Then, open [app.netlify.com](http://app.netlify.com) and add a "New site from Git". Choose your newly created repo and click on "Deploy site".

![Netlify Dashboard for Creating a new site](netlify-dashboard.png)
