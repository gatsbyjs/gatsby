---
title: Publishing Your Next Gatsby Site to AWS With AWS Amplify
date: "2018-09-04"
author: Nader Dabit
tags: ["gatsby", "serverless", "hosting", "blog", "aws amplify"]
excerpt: "In this post, we'll walk through how to host & publish your next Gatsby site to AWS"
canonicalLink: "https://aws-amplify.github.io/amplify-js/media/hosting_guide"
---

![Publishing Your Next Gatsby Site to AWS With AWS Amplify](gatsbyaws.jpeg)

In this post, we'll walk through how to host & publish your next Gatsby site to AWS using [AWS Amplify](https://aws-amplify.github.io/).

AWS Amplify is a combination of client library, CLI toolchain, and UI components. Amplify allow developers to get up & running with full-stack cloud-powered applications with features like authentication, GraphQL, storage, REST APIs, analytics, Lambda functions, hosting & more. 

Using the __Hosting__ feature, you can deploy your application to AWS as well as set up your site with Amazon Cloudfront CDN. This is what we'll be doing in this tutorial. Let's begin!

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

## Getting Started - AWS Amplify

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

- Choose your default editor: __(for me, this is Visual Studio Code)__
- Please choose the type of app that you're building: __javascript__
- What JavaScript framework are you using: __react__
- Source Directory Path: __src__
- Distribution Directory Path: __public__
- Build Command: __npm run-script build__
- Start Command: __npm run-script develop__
- Do you want to use an AWS profile? __Y__
- Please choose the profile you want to use: __default__


Now, the Amplify project has been created. You will see that you have a new amplify folder in your project directory as well as an .amplifyrc file. Both of these contain your AWS Amplify project configuration.

Next, we can type amplify into our command line & see all of the options that we have:

```sh
amplify 
```

At the bottom, we can see the available categories available to us. Hosting is the category we would like to enable, so let's do so now:

```sh
amplify add hosting
```

Here, we'll be prompted for the following:

- Select the environment setup: __DEV__
- hosting bucket name: __gatsbyproj-20180808112129-hosting-bucket (or type whatever you'd like the bucket name to be)__

This will set up our local project with everything we need, now we can publish the app to AWS. To do so, we'll run the following command:

```sh
amplify publish
```

Here, we'll be prompted for the following:

- Are you sure you want to continue? __Y__

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


