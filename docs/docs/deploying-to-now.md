---
title: Deploying to Now
---

[ZEIT Now](https://zeit.co/now) is a [cloud platform for serverless deployment](https://zeit.co/docs/v2/getting-started/introduction-to-now/) that you can use to deploy your Gatsby projects and [alias them](https://zeit.co/docs/v2/domains-and-aliases/aliasing-a-deployment/) to your personal domain or a free `.now.sh` suffixed URL.

This guide will show you how to get started in a few quick steps:

## Step 1: Getting Started with Gatsby

If you haven't already [set up a Gatsby project](https://www.gatsbyjs.org/docs/quick-start) you can do so by first installing Gatsby globally:

```shell
npm install --global gatsby-cli
```

Then generate a project with the following command:

```shell
gatsby new <your project name>
```

## Step 2: Getting Now

You can use Now by installing [Now Desktop](https://zeit.co/docs/v2/getting-started/installation/#now-desktop), which also installs Now CLI and keeps it up-to-date automatically.

To install Now CLI quickly with npm, use the following:

```shell
npm install -g now
```

## Step 3: Preparing to Deploy

With Now CLI installed, we can go on to deploy our previously setup Gatsby project by first creating a `now.json` file with the following contents:

```json:title=now.json
{
  "version": 2,
  "name": "my-gatsby-project",
  "builds": [
    {
      "src": "package.json",
      "use": "@now/static-build",
      "config": { "distDir": "public" }
    }
  ]
}
```

This `now.json` file will allow us to do several things, specifically:

- Use the [latest Now 2.0 version](https://zeit.co/blog/now-2) of [the platform](https://zeit.co/docs/v2/platform/overview/)
- Set the project name to `my-gatsby-project`
- Use the [@now/static-build builder](https://zeit.co/docs/v2/deployments/official-builders/static-build-now-static-build/) to take the `package.json` file as an entrypoint and use the `public` directory as the our content directory

The final step is to add a script to the `package.json` which will build our application:

```json:title=package.json
{
  "scripts": {
    ...
    "now-build": "npm run build"
  }
}
```

## Step 4: Deploying

You can deploy your application by running the following in the root of the project directory, where the `now.json` is:

```shell
now
```

That's all! Your application will now deploy, and you will receive a link similar to the following: https://my-gatsby-project-fhcc9hnqc.now.sh/

## References:

- [Deploying Gatsby with Now](https://zeit.co/examples/gatsby/)
