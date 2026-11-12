---
title: "Unified Hosting"
description: "Learn about Unified Hosting and the benefits of it in Gatsby Cloud"
---

<Announcement>

**Gatsby Cloud hosting has been retired.** Build and preview URLs on the `gtsb.io` domain no longer work (they now return `410 Gone`), and the `gatsbyjs.io` domain that replaced it is no longer served either. Host your Gatsby site on Netlify instead, where it gets a `<your-site>.netlify.app` URL and deploy previews out of the box. See the [Netlify Gatsby guide](https://docs.netlify.com/integrations/frameworks/gatsby/) and [the Gatsby Cloud migration announcement](https://www.netlify.com/blog/gatsby-cloud-evolution/).

</Announcement>

Unified Hosting (as signalled by a `gatsbyjs.io` domain) is an improvement made for [Gatsby Cloud Hosting](/docs/how-to/cloud/deploying-to-gatsby-cloud-hosting/) and is enabled by default for all builds.

## Benefits

Unified Hosting on Gatsby Cloud provides several benefits to your site:

- Password protection
- More accurate Lighthouse reports
- Faster initial page loads (as well as being on a CDN)
- Better route caching for browser speed
- Unlimited redirects
- Reverse proxy behavior

## FAQs

### What is the reason?

Unified Hosting was the current infrastructure for only Production builds. Now, this brings all of the [benefits](#benefits) above to all builds (including Pull Request and Preview builds). Gatsby has "unified" all infrastructure to this faster, more modern architecture.

### What is the impact?

The major change that you will see now is a difference in individual build URLs. Previously, these builds were deployed to a `gtsb.io` domain. With Unified Hosting, all builds moved to a `gatsbyjs.io` domain. Both domains have since been retired along with Gatsby Cloud; see the notice at the top of this page.

### Will old `gtsb.io` URLs continue to work?

No. The `gtsb.io` domain has been shut down and every URL on it returns `410 Gone`. Builds deployed there are no longer reachable, and there is no automatic redirect from `gtsb.io` to a new address.

If you still have links to a `gtsb.io` build or preview, replace them with links to your site's new hosting domain. Sites that have moved to Netlify are served from `<your-site>.netlify.app` (or your custom domain), and each pull request gets its own deploy preview URL. See [Deploy Previews on Netlify](https://docs.netlify.com/site-deploys/deploy-previews/).

### What do the new URLs look like?

All new URLs will be the same format, but hosted on a subdomain of `gatsbyjs.io` (as opposed to `gtsb.io`).

|              | Old                            | New                                |
| ------------ | ------------------------------ | ---------------------------------- |
| Site         | `build-{UUID}.gtsb.io`         | `build-{UUID}.gatsbyjs.io`         |
| Pull Request | `build-{UUID}.gtsb.io`         | `build-{UUID}.gatsbyjs.io`         |
| Preview      | `preview-{SITEPREFIX}.gtsb.io` | `preview-{SITEPREFIX}.gatsbyjs.io` |

### Are URLs deterministic?

URLs are deterministic besides the UUID generated for a given build. For example, the glob pattern for a Pull Request build would be `build-*.gatsbyjs.io`.
