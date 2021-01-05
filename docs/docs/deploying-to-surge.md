---
title: Deploying to Surge
---

In this guide, you will learn how to deploy your Gatsby site to Surge.

[Surge](https://surge.sh/) is a cloud platform for hosting static websites, which is extremely simple to use but offers customization options for those who need them.

Their generous free tier permits unlimited publishing, using custom domains, and basic SSL, with more features available through the professional plan.

This guide will show you how to get started in a few quick steps:

## Step 1: Getting Surge

To install the surge CLI with `npm`, paste the following into your terminal:

```shell
npm install -g surge
```

## Step 2: Preparing to deploy

Build a site by running this command in your project's root directory:

```shell
gatsby build
```

This generates a publishable version of your site in the `./public` folder.

## Step 3: Deploying

You can deploy your site by running the following in the root of the project directory.

```shell
surge public/
```

If this is your first time using Surge, you'll be prompted to create a (free) account from the command line. This will only happen once.

Press `enter` to confirm that the path to your `public/` folder is correct, and that you'd like to keep the randomly generated subdomain name (it can be edited if not).

You're done! Your terminal will output the address of the domain where your site was deployed.

## Step 4: Bonus - Remembering a domain

To ensure future deploys are sent to the same location, you can store the domain name in a [`CNAME`](https://surge.sh/help/remembering-a-domain) file that is added your project. First, create a [`static` directory](/docs/how-to/images-and-media/static-folder/) at the root of your Gatsby project if it doesn't already exist. Then put a file named `CNAME` (no file extension) in the `static` directory.

Assuming your site was deployed to `https://my-cool-domain.surge.sh`, the following command will add the file for you:

```shell
echo my-cool-domain.surge.sh > static/CNAME
```

Consult the [Surge Docs](https://surge.sh/help/) for information about how to customize your deployment further. Remember that each time you redeploy your site, you will need to rerun `gatsby build` first.

## References:

- [Surge Documentation](https://surge.sh/help/)
- [Deploying to a Custom Domain](https://surge.sh/help/adding-a-custom-domain)
