---
title: "Environment Variables"
---

You can easily provide environment variables to your site. Just add a `.env.development` and/or `.env.production` file in your root folder for development or production builds respectively. The environment variables are embedded during build time using Webpack's [DefinePlugin](https://webpack.js.org/plugins/define-plugin/). Because these variables are provided at build time, you will need restart your dev server or rebuild your site after changing them.

## Example

```
# Example .env.development file

API_URL=https://dev.example.com/api
```

```
# Example .env.production file

API_URL=https://example.com/api

```

These variables will be available to your site as `process.env.API_URL`.

> You can not override certain environment variables as some are used internally for optimizations during build

Reserved environment variables:

- `NODE_ENV`
- `PUBLIC_DIR`
