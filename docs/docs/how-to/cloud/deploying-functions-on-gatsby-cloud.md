---
title: "Deploying Functions on Gatsby Cloud"
description: "Learn how to deploy Gatsby Serverless Functions on Gatsby Cloud"
---

## Introduction

The Gatsby framework now supports general access to serverless functions in local development as well as in Gatsby Cloud. These [express](https://expressjs.com/)-style functions allow Gatsby developers to build out secure, scalable APIs alongside their Gatsby projects.

### Prerequisites

Functions are a Gatsby core feature and are not specific to Gatsby Cloud. To learn more about how to implement functions in the Gatsby framework, check out the [Reference](https://www.gatsbyjs.com/docs/reference/functions/) guide in the open source documentation.

### Routing in gatsby cloud

Functions that are included in a Gatsby project and deployed on Gatsby cloud are available at any build URL. This includes any preview URLs (`gstb.io` domain) or Hosting URLs (on `gatsbyjs.io` or your custom domain).

```javascript:title=src/api/hello-world.js
const sample = (req, res) => {
    res.status(200).json({"message": "Hello, World!"})
};

export default sample;
```

### Environment variables

Functions will have access to any environment variables that you’ve added to either the production or preview environments in Gatsby Cloud.

![Sample Environment Variable](../../images/env_vars.png)

```javascript:title=src/api/hello-world.js
const sample = (req, res) => {
  let key = process.env.SAMPLE_VAR;
  //run code that uses key

  res.status(200).json({ message: "Hello, World!" });
};

export default sample;
```

### Setting cache headers for functions

Users can set custom header to control cache settings to ensure that functions invocations are appropriately handled when served to CDN users. Any cache-header setting that users add to their function will be passed through and respected on the CDN:

```javascript:title=src/api/hello-world.js
const sample = (req, res) => {
  res.setHeader(`Cache-Control`, `public, max-age=60`);
  res.status(200).json({ message: "Hello, World!" });
};

export default sample;
```

### Accessing logs for functions

You can access function logs by viewing the build details for the CMS Preview, Pull Request Build, or Production build. See the [Build Logs]() article for more information on accessing build details.

![Function Invocation Log](../../images//function-invocation-log.png)

### Tracking invocation counts

Like the bandwidth and request tracking in Gatsby Cloud, users can track their invocation count across all their Gatsby sites on any workspace landing page as well as site-specific usage on any site page.

Additionally, users can view function-specific invocation counts in the function logs of the build details for any build that implements that function. See the [Platform Limits](/docs/reference/cloud/platform-limits) article for info on function invocation limits.

![Function Invocation Count](../../images/function-invocation-count.png)
