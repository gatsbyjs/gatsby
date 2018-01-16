# gatsby-transformer-screenshot

Plugin for creating screenshots of website URLs using an AWS Lambda
Function. This plugin looks for `SitesYaml` nodes with a `url`
property, and creates `Screenshot` nodes with an `imageFile` field. 

[Live demo](https://thatotherperson.github.io/gatsby-screenshot-demo/)
([source](https://github.com/ThatOtherPerson/gatsby-screenshot-demo))

## Install

`npm install gatsby-transformer-screenshot`

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
          imageFile
        }
      }
    }
  }
}
```

imageFile is a PNG file like any other loaded from your filesystem, so you can use this plugin in combination with `gatsby-image`.

## Lambda setup

To build the Lambda package, run `npm run lambda-package` in this directory. A file called `lambda-package.zip` will be generated - upload this as the source of your AWS Lambda. You will also need to create an S3 bucket - screenshots will be saved in the root of this bucket. Set the cache expiration time by creating a (Lifecycle Policy)[https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-lifecycle.html] for the bucket that marks objects for expiration after your desired period of days. Finally, you will need to set `S3_BUCKET` as an environment variable for the lambda, and be sure to set the `lambdaName` property in `gatsby-config.js`.
