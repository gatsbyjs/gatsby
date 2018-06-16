# gatsby-plugin-netlify-cms

Automatically generates an `admin/index.html` with a default Netlify CMS implementation.

Netlify CMS is a React single page app for editing git based content via API.
Its built for non-technical and technical editors alike, and its super easy to
install and configure. For more details, check out the [docs
site](https://netlifycms.org).

## Install

```shell
npm install --save netlify-cms
npm install --save gatsby-plugin-netlify-cms
```

## How to use

Add the Netlify CMS plugin in your `gatsby-config.js`:

```javascript
plugins: [`gatsby-plugin-netlify-cms`];
```

Then add your Netlify CMS [configuration
file](https://www.netlifycms.org/docs/add-to-your-site/#configuration) in
`static/admin/config.yml`.

## Options
The Netlify CMS can be configured via the plugin options below. You can learn
about how to pass options to plugins in the [Gatsby
docs](https://www.gatsbyjs.org/docs/plugins/#how-to-use-gatsby-plugins).

### `modulePath`

If you need to customize Netlify CMS, e.g. registering [custom
widgets](https://www.netlifycms.org/docs/custom-widgets/#registerwidget) or
styling the [preview
pane](https://www.netlifycms.org/docs/customization/#registerpreviewstyle),
you'll need to do so in a JavaScript module and provide Gatsby with the path to
your module via the `modulePath` option:

```javascript
plugins: [
  {
    resolve: `gatsby-plugin-netlify-cms`,
    options: {
      // One convention is to place your Netlify CMS customization code in a
      // `src/cms` directory.
      modulePath: `${__dirname}/src/cms/cms.js`,
    },
  },
];
```

The js module might look like this:

```javascript
// Your module must at least include these three imports
import React from "react";
import CMS from "netlify-cms";
import "netlify-cms/dist/cms.css";

// Let's say you've created widget and preview components for a custom image
// gallery widget in separate files
import ImageGalleryWidget from "./image-gallery-widget.js";
import ImageGalleryPreview from "./image-gallery-preview.js";

// Register the imported widget:
CMS.registerWidget("image-gallery", ImageGalleryWidget, ImageGalleryPreview);
```

### `enableIdentityWidget`

`enableIdentityWidget` is `true` by default, allowing [Netlify
Identity](https://www.netlify.com/docs/identity/) to be used without
configuration, but you may need to disable it in some cases, such as when using
a Netlify CMS backend that conflicts. This is currently known to be the case
when using the GitLab backend, but only when using implicit OAuth.

```javascript
plugins: [
  {
    resolve: `gatsby-plugin-netlify-cms`,
    options: {
    enableIdentityWidget: true,
    },
  },
];
```

## Support

For help with integrating Netlify CMS with Gatsby, check out the community
[Gitter](https://gitter.im/netlify/netlifycms).
