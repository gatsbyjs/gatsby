---
title: Deploying to the Moovweb XDN
---

This guide will cover deploying a Gatsby site to the Moovweb XDN.

The [Moovweb XDN](https://www.moovweb.com/) is an all-in-one platform to develop, deploy, preview, experiment on, monitor, and run your headless frontend with a focus on support large. The XDN is focused on large, dynamic websites and best in class performance through an integrated CDN, CDN-as-JavaScript, predictive prefetching, and performance monitoring. Moovweb offers a free tier.

This page summarizes the content in the XDN developer docs [Gatsby](https://developer.moovweb.com/guides/gatsby) guide. Refer to that guide for additional details.

## Step 1: Sign up for a free XDN account

You can sign up for free [here](https://moovweb.app/signup).

## Step 2: Install the XDN CLI

Install the XDN CLI via `npm`:

```shell
npm install -g @xdn/cli
```

## Step 3: Run XDN init

Run the XDN `init` command in your project directory:

```shell
cd my-gatsby-project
xdn init
```

This will automatically add all of the required XDN libraries and files to your project. The full list of changes XDN `init` performs is listed in the [Moovweb XDN Gatsby](https://developer.moovweb.com/guides/gatsby) guide.

## Step 4: Test locally

XDN CLI will emulate the XDN's integrated CDN locally. You can test the XDN integration with your project locally by using the `run` command:

```shell
xdn run
```

## Step 5: Deploy

To deploy your app on the XDN run:

```shell
xdn deploy
```

When the deployment finishes, the output will confirm the final deployment URL. Below is an example:

```shell

***** Deployment Complete *************************************************************
*                                                                                     *
*  🖥  XDN Developer Console:                                                         *
*  https://moovweb.app/tony-stark/gatsby-starter-default/env/default/builds/1         *
*                                                                                     *
*  🌎 Website:                                                                        *
*  https://tony-stark-gatsby-starter-default-default.moovweb-edge.io                  *
*                                                                                     *
***************************************************************************************
```

If you want to customize the domain or add HTTPS/SSL/TLS certificates refer to the [Production guide](https://developer.moovweb.com/guides/production).

## Additional Resources

- [Moovweb XDN Gatsby guide](https://developer.moovweb.com/guides/gatsby)
- [Moovweb XDN Deploying guide](https://developer.moovweb.com/guides/deploying)
- [Moovweb XDN Production guide](https://developer.moovweb.com/guides/production)

If you run into issues you can get help via the [Moovweb forums](https://forum.moovweb.com/).
