---
title: A/B Testing
---

There are a number of potential approaches to applying A/B testing tools to Gatsby websites.

Traditional A/B testing tools can slow down your site, and in general don't work as well with statically generated HTML pages.

However, there are several potential approaches:

- **Use traditional A/B testing tools** like Optimizely. This will slow down your website because the client-side JavaScript used by these tools is quite heavy. In addition, you'll need to make sure to use the correct React component, since you should not be overwriting the DOM manually.

- **Use branch-based A/B testing**. For teams of developers without any content editors using a CMS, tools like [Netlify's branch-based A/B testing can work quite well with Gatsby.](./how-to/testing/ab-testing-with-google-analytics-and-netlify.md)

- **Edge-based page splitting**. Some JAMStack vendors like [Outsmartly](https://www.outsmartly.com/) and [Uniform](https://uniform.dev/) have edge CDN integrations that allow them to serve multiple versions of a page, enabling personalization and A/B testing without a performance hit.
