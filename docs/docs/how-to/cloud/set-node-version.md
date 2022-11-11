---
title: "Set a Node.js Version for Your Site"
description: "Learn how to set a Node version for your Gatsby Cloud site."
---

## Introduction

You can specify a Node.js version for site in Gatsby Cloud in two different ways, by environment variable or `.nvmrc` file. If you don't set a Node version, Gatsby cloud will use Node 18 by default.

### Environment variable

You can set your Node.js version using the `NODE_VERSION` environment variable inside Gatsby Cloud. Read more about [setting environment variables](/docs/reference/cloud/managing-environment-variables).

### Using nvm

You can include a `.nvmrc` file in your project repository, and Gatsby Cloud will read the Node version from that file.

Example format:

```javascript:title=.nvmrc
v18.9.0
```
