---
title: Adding an Asset Prefix
---

Gatsby produces static content that can be hosted _anywhere_ at scale in a cost-effective manner. This static content is comprised of HTML files, JavaScript, CSS, images, and more that power your great, Gatsby application.

There are scenarios in which it may be advantageous or necessary to deploy _assets_ (where an asset is a non-HTML resource, e.g. JavaScript, CSS, etc.) to a separate domain. This can oftentimes be used to enable functionality like a CDN or a particular hosting strategy that your company may employ where assets need to be separate from the core application.

This `assetPrefix` functionality is available starting in gatsby@2.2.0, so that you can seamlessly use Gatsby with assets hosted from a separate domain. To use this functionality, ensure that your version of `gatsby` specified in `package.json` is at least `2.2.0`.

## Usage

### Adding to `gatsby-config.js`

```js:title=gatsby-config.js
module.exports = {
  assetPrefix: `https://cdn.example.com`,
}
```

That was easy! One more step - when we build out this application, we need to add a flag so that Gatsby picks up this option.

### The `--prefix-paths` flag

When building with an `assetPrefix`, we require a `--prefix-paths` flag. If this flag is not specified, the build will ignore this option, and build out content as if it was hosted on the same domain. To ensure we build out successfully, use the following command:

```shell
gatsby build --prefix-paths
```

That's it! We now have an application that is ready to have its assets deployed from a CDN and its core files (e.g. HTML files) can be hosted on a separate domain.

## Building / Deploying

Once your application is built out, all assets will be automatically prefixed by this asset prefix. For example, if we have a JavaScript file `app-common-1234.js`, the script tag will look something like:

```html
<script src="https://cdn.example.com/app-common-1234.js"></script>
```

However - if we were to deploy our application as-is, those assets would not be available! We can do this in a few ways, but the general approach will be to deploy the contents of the `public` folder to _both_ your core domain, and the CDN/asset prefix location.

### Using `onPostBuild`

We expose an [`onPostBuild`](/docs/node-apis/#onPostBuild) API hook. This can be used to deploy your content to the CDN, like so:

```js:title=gatsby-node.js
const assetsDirectory = `public`

exports.onPostBuild = async function onPostBuild() {
  // do something with public
  // e.g. upload to S3
}
```

### Using `package.json` scripts

Additionally, we can use an npm script, which will let us use some command line interfaces/executables to perform some action, in this case, deploying our assets directory!

In this example, I'll use the `aws-cli` and `s3` to sync the `public` folder (containing all our assets) to the `s3` bucket.

```json:title=package.json
{
  "scripts": {
    "build": "gatsby build --prefix-paths",
    "postbuild": "aws s3 sync public s3://mybucket"
  }
}
```

Now whenever the `build` script is invoked, e.g. `npm run build`, the `postbuild` script will be invoked _after_ the build completes, therefore making our assets available on a _separate_ domain after we have finished building out our appliacation with prefixed assets.

## Additional Considerations

### Usage with `pathPrefix`

The [`pathPrefix`](/docs/path-prefix/) feature can be thought of as semi-related to this feature. That feature allows _all_ your website content to be prefixed with some constant prefix, for example you may want your blog to be hosted from `/blog` rather than the project root.

This feature works seamlessly with `pathPrefix`. Build out your application with the `--prefix-paths` flag and you'll be well on your way to hosting an application with its assets hosted on a CDN, and its core functionality available behind a path prefix.
