# gatsby-transformer-screenshot

Plugin for creating screenshots of website URLs using an AWS Lambda
Function. This plugin looks for `SitesYaml` nodes with a `url`
property, and creates `Screenshot` nodes with an `screenshotFile` field. 

[Live demo](https://thatotherperson.github.io/gatsby-screenshot-demo/)
([source](https://github.com/ThatOtherPerson/gatsby-screenshot-demo))

## Install

`npm install gatsby-transformer-screenshot`

## Lambda setup

AWS Lambda is a "serverless" computing platform that lets you run code in response to events, without needing to set up a server. This plugin uses a Lambda function to take screenshots and store them in an AWS S3 bucket.

First, you will need to (create a S3 bucket)[https://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html] for storing screenshots. Once you have done that, create a (Lifecycle Policy)[https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-lifecycle.html] for the bucket that sets a number of days before files in the bucket expire. Screenshots will be cached until this date.

To build the Lambda package, run `npm run build-lambda-package` in this directory. A file called `lambda-package.zip` will be generated - upload this as the source of your AWS Lambda. Finally, you will need to set `S3_BUCKET` as an environment variable for the lambda.

## How to use

```javascript
// in your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-screenshot`,
    options: {
      lambdaName: `gatsby-screenshot-lambda`,
      region: 'us-west-2',
      credentials: {        // optional
        accessKeyId: 'xxxx',
        secretAccessKey: 'xxxx',
        sessionToken: 'xxxx' // optional
      }
    }
  }
]
```

AWS provides several ways to configure credentials; see here for more information: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html. If you set `credentials` in this plugin's options, it will override all the other methods.

## How to query

You can query for screenshot files as shown below:

```graphql
{
  allSitesYaml {
    edges {
      node {
        url
        childScreenshot {
          screenshotFile
        }
      }
    }
  }
}
```

screenshotFile is a PNG file like any other loaded from your filesystem, so you can use this plugin in combination with `gatsby-image`.
