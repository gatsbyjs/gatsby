# gatsby-transformer-screenshot

Plugin for creating screenshots of website URLs using an AWS Lambda
Function. This plugin looks for `SitesYaml` nodes with a `url`
property, and creates `Screenshot` child nodes with a `screenshotFile` field.

[Live demo](https://thatotherperson.github.io/gatsby-screenshot-demo/)
([source](https://github.com/ThatOtherPerson/gatsby-screenshot-demo))

Data should be in a YAML file named `sites.yml` and look like:

```yaml
- url: https://reactjs.org/
  name: React
- url: https://about.sourcegraph.com/
  name: Sourcegraph
- url: https://simply.co.za/
  name: Simply
```

## Install

```shell
npm install gatsby-transformer-screenshot
```

## How to use

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-screenshot`,
      options: {
        // See "Lambda setup" below to see how to create an endpoint
        screenshotEndpoint: `your-aws-endpoint`,
      }
    }
  ],
}
```

By default, the plugin will target nodes sourced from a YAML file named `sites.yml`.

To source additional node types, supply an array of the types to a `nodeTypes` option on the plugin.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-screenshot`,
      options: {
        nodeTypes: [`StartersYaml`, `WhateverType`],
      },
    },
  ],
}
```

## How to query

You can query for screenshot files as shown below:

```graphql
{
  allSitesYaml {
    edges {
      node {
        url
        childScreenshot {
          screenshotFile {
            id
          }
        }
      }
    }
  }
}
```

screenshotFile is a PNG file like any other loaded from your filesystem, so you can use this plugin in combination with `gatsby-plugin-image`.

## Lambda setup

**You need to run a screenshot service on AWS Lamdba yourself.**

AWS Lambda is a "serverless" computing platform that lets you run code in response to events, without needing to set up a server. This plugin uses a Lambda function to take screenshots and store them in an AWS S3 bucket.

First, you will need to [create a S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html) for storing screenshots. Once you have done that, create a [Lifecycle Policy](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-lifecycle.html) for the bucket that sets a number of days before files in the bucket expire. Screenshots will be cached until this date.

To build the Lambda package, run `npm run build-lambda-package` in this directory. A file called `lambda-package.zip` will be generated - upload this as the source of your AWS Lambda. Finally, you will need to set `S3_BUCKET` as an environment variable for the lambda inside AWS.

To set up the HTTP interface, you will need to use AWS API Gateway. Create a new API, create a new resource under `/`, select "Configure as proxy resource", and leave all the settings with their defaults. Create a method on the new resource, selecting "Lambda Function Proxy" as the integration type, and fill in the details of your lambda.

## Placeholder image

If your site pulls a lot of screenshots it might be beneficial to use placeholder image instead of downloading and processing all the screenshots. It will help with data sourcing and query running times.

You can use placeholder image by setting `GATSBY_SCREENSHOT_PLACEHOLDER` environment variable when running `npm run develop`:

```shell
GATSBY_SCREENSHOT_PLACEHOLDER=true gatsby develop
```

or by using [`dotenv`](https://www.gatsbyjs.com/docs/environment-variables/#server-side-nodejs) in your `gatsby-config.js` and adding `GATSBY_SCREENSHOT_PLACEHOLDER` to `.env.development` file in root of your project:

```shell:title=.env.development
GATSBY_SCREENSHOT_PLACEHOLDER=true
```
