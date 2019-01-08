---
title: Deploying to S3/Cloudfront
---

In this guide, we'll walkthrough how to host & publish your next Gatsby site to AWS using [S3](https://aws.amazon.com/s3/). If you are looking for a managed hosting service, the AWS Amplify Console offers the fastest way to deploy your Gatsby site on AWS. The Amplify Console provides features such as continuous deployment, multiple environments w. feature branch deploys, custom domains with SSL, redirects/rewrites, atomic deploys, and password protection. [Deploy using AWS Amplify](/docs/deploying-to-aws-amplify/)

Additionally, you can add [lambda functions](https://serverless.com/framework/docs/providers/aws/guide/functions/), [cloudfront](https://github.com/serverless/examples/tree/master/aws-node-single-page-app-via-cloudfront), and other AWS services later on as you expand.

## Getting Started - Gatsby

First, we'll want to create a new Gatsby project. If you don't already have Gatsby installed, install it:

```shell
npm install --global gatsby-cli
```

Next, we'll create a new Gatsby site:

```shell
gatsby new my-gatsby-site
```

Finally, change into the new site directory:

```shell
cd my-gatsby-site
```

## Getting Started - AWS CLI

Create a [IAM account](https://console.aws.amazon.com/iam/home?#) with administration permissions and create a access id and secret for it.
You'll need these in the next step.

Install the AWS CLI and configure it (ensure python is installed before running these commands)

```shell
pip install aws
aws configure
```

The AWS CLI will now prompt you for the key & secret, add them.

## Getting Started - gatsby-plugin-s3

Now that we have our Gatsby site up & running, let's add hosting & make the site live on AWS.

First, we'll install the Gatsby S3 plugin:

```shell
npm i gatsby-plugin-s3
```

Add it to your `gatsby-config.js`: (don't forget to change the bucket name)

```
plugins: [
 {
     resolve: `gatsby-plugin-s3`,
     options: {
         bucketName: 'my-website-bucket'
     },
 },
]
```

And finally, add the deployment script to your `package.json`:

```js
"scripts": {
   ...
   "deploy": "gatsby-plugin-s3 deploy"
}
```

That's it!
Run `npm run build && npm run deploy` to do a build and have it immediately deployed to S3!

## Taking things a step further

Read on how to use the serverless framework to add lambda functions, cloudfront, and more:

- [Using serverless with gatsby-plugin-s3](https://github.com/jariz/gatsby-plugin-s3/blob/master/recipes/with-serverless.md)

## References:

- [Publishing Your Next Gatsby Site to AWS With AWS Amplify](https://www.gatsbyjs.org/blog/2018-08-24-gatsby-aws-hosting/)
- [Escalade Sports: From $5000 to $5/month in Hosting With Gatsby](https://www.gatsbyjs.org/blog/2018-06-14-escalade-sports-from-5000-to-5-in-hosting/)
- [Deploy your Gatsby.js Site to AWS S3](https://benenewton.com/deploy-your-gatsby-js-site-to-aws-s-3)