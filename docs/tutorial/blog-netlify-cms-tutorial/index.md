---
title: Make a Gatsby Blog with Netlify CMS
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/JeTqxCJC56Q" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="YouTube video: How to make a fully-featured dev blog in under 10 minutes"></iframe>

Do you want a personal website with a blog running at `your-domain/blog`? Do you like super fast websites with out-of-the-box performance, SEO, and best practices? Do you like automating your work with a straightforward CMS? Well you're in luck!

This tutorial will use [gatsby-personal-starter-blog](http://t.wang.sh/gatsby-personal-starter-blog), a Gatsby starter based on the very popular [gatsby-starter-blog](/starters/gatsbyjs/gatsby-starter-blog/). The differences are that `gatsby-personal-starter-blog` is configured to run the blog on a subdirectory `/blog`, and comes pre-installed with [Netlify CMS](https://www.netlifycms.org/), with VS Code highlighting for code blocks.

## Walk through setting up a site in 4 steps:

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

You'll notice now you can go to `[localhost:8000](http://localhost:8000)` to see your new site, but what's cool is that Netlify CMS is pre-installed, and you can access it at `localhost:8000/admin`. A CMS, or content management system, is useful because you can add content like blog posts from a dashboard on your site instead of having to add posts manually with Markdown. However, you'll likely want to be able to access the CMS from a deployed website, not just locally. For that, you'll need to deploy to Netlify, set up continuous deployment, and do a few configurations.

### Step 3

Open the project in your code editor and open `static/admin/config.yml`. Replace the following piece of code with these settings, replacing `your-username/your-repo-name` with your GitHub username and repo. Then push this code to GitHub.

```diff
// Replace this
backend:
  name: test-repo

// With this
backend:
  name: github
  repo: your-username/your-repo-name
```

To make sure that Netlify CMS has access to your GitHub repo, you need to set up an OAuth application on GitHub. The instructions for that are here: [https://www.netlify.com/docs/authentication-providers/#using-an-authentication-provider](https://www.netlify.com/docs/authentication-providers/#using-an-authentication-provider). Once you've configured an authentication provider then you'll be able to use Netlify CMS at your deployed site to add new posts.

![Netlify and GitHub Authorization](https://cdn.netlify.com/67edd5b656c432888d736cd40125cb61376905bb/c1cba/img/docs/github-oauth-config.png)

### Step 4

Open [github.com](http://github.com) and create a new repository, with the same name as your project. Push your new Gatsby site's code to GitHub using the following Terminal commands:

```sh
git init
git add .
git commit -m "init"
git remote add origin https://github.com/[your-username]/[your-repo-name].git
git push -u origin master
```

Then, open [app.netlify.com](http://app.netlify.com) and add a "New site from Git". Choose your newly created repo and click on "Deploy site".

![Netlify Dashboard](netlify-dashboard.png)

## Customizing your site

Head into `gatsby-config.js` and you can edit your siteMedata, add a Google Analytics tracking ID, and your app icon/favicon.
