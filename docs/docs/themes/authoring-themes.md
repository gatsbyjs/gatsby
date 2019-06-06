---
title: How to Author a Theme
---

## What’s contained in this tutorial?

By the end of this tutorial, you’ll have done the following:

- set up your environment for theme development
- built a Gatsby Theme

## Prerequisites (if any)

Before following this tutorial, you should have experience building a Gatsby site.

> ⚠⚠ Gatsby Themes are currently experimental ⚠⚠

## Setting up your environment for theme development

While there are many ways to develop a Gatsby Theme, the recommended way is to create a Yarn workspace. Yarn workspaces allow you test how a theme might behave inside of a site without you having to actually publish a theme to npm. You are, of course, welcome to develop your theme any way you’d like.

First, if you don’t have yarn installed, you can follow these instructions (https://yarnpkg.com/en/docs/install) to install it.

Next, create a directory for the project:

```bash
mkdir theme-workspace
```

`cd` into that folder and create two directories. The first directory will be called the name of the site you use to test your theme. In this tutorial, I’ll call it `sandbox-app`.

```bash
cd theme-workspace
mkdir sandbox-app
```

Then, create a directory called `themes`, and inside it, add a directory called `gatsby-theme-my-theme`.

```bash
mkdir themes
cd themes
mkdir gatsby-theme-my-theme
```

Conventionally, Gatsby Themes are prefixed with `gatsby-theme-*`. So, if you want to name your theme`awesome`, you can call it`gatsby-theme-awesome`.

Once you have that set up, add a `package.json` file to the root of the project. It should look like this:

```json:title=package.json
{
  "private": true,
  "workspaces": ["themes/*", "sandbox-app"]
}
```

`”private”: true` is required for Yarn workspaces, so don’t forget it! The `workspaces` key takes an array. We pass it `themes/*` so that any themes you create inside of it will be included. We also include the `sandbox-app` as a separate workspace.

Next, `cd` into the `sandbox-app` directory and create a `package.json` file:

```bash
cd sandbox-app
touch package.json
```

```json:title=sandbox-app/package.json
{
  "name": "sandbox-app",
  "private": true,
  "version": "0.1.0",
  "main": "index.js"
}
```

Then, `cd` into the `gatsby-theme-my-theme` directory, and create a similar `package.json` file':

```bash
cd ../gatsby-theme-my-theme
touch package.json
```

```json:title=gatsby-theme-my-theme/package.json
{
  "name": "gatsby-theme-my-theme",
  "private": true,
  "version": "0.1.0",
  "main": "index.js"
}
```

Note: It's really important that the `name` key in the package.json files matches the name of the directory it is in.

Your directory structure should look like this now:

```
sandbox-app/
  package.json
gatsby-theme-my-theme/
  package.json
```

One of the best parts about Yarn workspaces is you can run commands for all of your directories from the root of your project using the `yarn workspace <package>` command.

To try it out, you'll need to install Gatsby's dependencies in your `sandbox-app`. To do so, run this command:

```bash
yarn workspace example add gatsby react react-dom
```

Next, add these as `peerDependencies` to your theme.

```bash
yarn workspace gatsby-theme-my-theme add --peer gatsby react react-dom
```

You want these dependencies as `peerDependencies` in your theme because sites consuming your theme won't work without them. If you added these as `dependencies` to your theme, you would ship a copy of them to any sites that consume your theme. You want to avoid this, because it's possible your theme could have a different copy of the dependencies than the consuming site. But, if the consuming site doesn't have these dependencies, it will break. Including these as `peerDependencies` will show a warning to the developers of the consuming site reminding them to install their own copies of these dependencies.

## What did you just do?

In this tutorial, you did the following:

- learned how to **\_\_**
- built a \***\*\_\*\***
- used a **\_\_\_** with Gatsby

## What’s next

If there are more parts to the tutorial, link to the next step here.

## Other resources

If there are other resources you think readers would benefit from or next steps they might want to take after reading your article, add
them at the bottom in an "Other Resources" section. You can also mention here any resources that helped you write the article (blog posts, outside tutorials, etc.).

- Link to a blog post
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
