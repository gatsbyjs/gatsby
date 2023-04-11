---
title: "Set a Node.js Version for Your Site"
description: "Learn how to set a Node version for your Gatsby Cloud site."
---

## Instructions

You can specify a [Node.js](https://nodejs.org/en) version for your site in Gatsby Cloud in two different ways:

- Through an environment variable
- With a `.nvmrc` file

If you don't explicitly set a Node.js version yourself, Gatsby Cloud will use its default version (current minimum supported Node.js version by Gatsby).

### Environment variable

You can set your Node.js version using the `NODE_VERSION` environment variable inside Gatsby Cloud. Read more about [setting environment variables](/docs/reference/cloud/managing-environment-variables).

### Using nvm

You can include a `.nvmrc` file in your project repository and Gatsby Cloud will read the Node.js version from that file.

An example file could look like this:

```javascript:title=.nvmrc
v18.9.0
```

You can write out the version you're currently using locally like this:

```shell
node -v > .nvmrc
```

## Troubleshooting

Sometimes Gatsby Cloud is not recognizing your new Node.js version after you set it. In those instances, try disabling your builds and preview (find them under "Site Settings" > "Builds") and then re-enabling them. This will reset your build container and make sure to use your new Node.js version.
