---
title: Deploying to S3/Cloudfront
---

In this guide, we'll walk through how to host & publish your next Gatsby site to AWS using [AWS Amplify](https://aws-amplify.github.io/).

AWS Amplify is a combination of client library, CLI toolchain, and UI components. Amplify allow developers to get up & running with full-stack cloud-powered applications with features like authentication, GraphQL, storage, REST APIs, analytics, Lambda functions, hosting & more.

Using the **Hosting** feature, you can deploy your application to AWS as well as set up your site with Amazon Cloudfront CDN. This is what we'll be doing in this tutorial. Let's begin!

## Getting Started - Gatsby

First, we'll want to create a new Gatsby project. If you don't already have Gatsby installed, install it:

```sh
npm install - global gatsby-cli
```

Next, we'll create a new Gatsby site:

```sh
gatsby new my-gatsby-site
```

Finally, change into the new site directory:

```sh
cd my-gatsby-site
```

## Getting Started - AWS Amplify

Now that we have our Gatsby site up & running, let's add hosting & make the site live on AWS.

First, we'll install the AWS Amplify CLI:

```sh
npm i -g @aws-amplify/cli
```

With the AWS Amplify CLI installed, we now need to configure it with an IAM User:

```sh
amplify configure
```

> For a video walkthrough of how to configure the AWS Amplify CLI, click [here](https://www.youtube.com/watch?v=fWbM5DLh25U).

Now, we can create a new Amplify project in the root of our Gatsby project:

```sh
amplify init
```

- Choose your default editor: **(for me, this is Visual Studio Code)**
- Please choose the type of app that you're building: **javascript**
- What JavaScript framework are you using: **react**
- Source Directory Path: **src**
- Distribution Directory Path: **public**
- Build Command: **npm run-script build**
- Start Command: **npm run-script develop**
- Do you want to use an AWS profile? **Y**
- Please choose the profile you want to use: **default**

Now, the Amplify project has been created. You will see that you have a new amplify folder in your project directory as well as an .amplifyrc file. Both of these contain your AWS Amplify project configuration.

Next, we can type amplify into our command line & see all of the options that we have:

```sh
amplify
```

At the bottom, we can see the available categories available to us. Hosting is the category we would like to enable, so let's do so now:

```sh
amplify add hosting
```

Here, we'll be prompted for the following:

- Select the environment setup: **DEV**
- hosting bucket name: **gatsbyproj-20180808112129-hosting-bucket (or type whatever you'd like the bucket name to be)**

This will set up our local project with everything we need, now we can publish the app to AWS. To do so, we'll run the following command:

```sh
amplify publish
```

Here, we'll be prompted for the following:

- Are you sure you want to continue? **Y**

Now, our resources will be pushed up to our account & our site will be published to a live url!

What just happened? A few things:

1. Amplify runs npm run build to build a new distribution of your app
2. A new S3 bucket is created in your AWS account
3. All code in the public directory is uploaded to the S3 bucket

We should have also be given the URL that the site is hosted on. At any time that we would like to get the url for our site, we can run:

```sh
amplify status
```

This command should give us all of the info about our app including the url of our website.

If we ever want to configure the hosting setup, including adding Cloudfront, we can run:

```sh
amplify configure hosting
```

Here, we'll be prompted for what we would like to change about the project configuration.

> To learn more about AWS Amplify, check out the [Getting Started](https://aws-amplify.github.io/media/get_started) page.

## References:

- [Publishing Your Next Gatsby Site to AWS With AWS Amplify](https://www.gatsbyjs.org/blog/2018-08-24-gatsby-aws-hosting/)
- [Escalade Sports: From $5000 to $5/month in Hosting With Gatsby](https://www.gatsbyjs.org/blog/2018-06-14-escalade-sports-from-5000-to-5-in-hosting/)
- [Deploy your Gatsby.js Site to AWS S3](https://benenewton.com/deploy-your-gatsby-js-site-to-aws-s-3)
