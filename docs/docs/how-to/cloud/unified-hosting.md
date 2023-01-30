---
title: "Unified Hosting"
description: "Learn about Unified Hosting and the benefits of it in Gatsby Cloud"
---

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

The major change that you will see now is a difference in individual build URLs. Previously, these builds were deployed to a `gtsb.io` domain. Today, all builds will be deployed to a `gatsbyjs.io` domain.

### Will old `gtsb.io` URLs continue to work?

Yes, any builds deployed before Unified Hosting's rollout will continue to work on the `gtsb.io` domain.

### What do the new URLs look like?

All new URLs will be the same format, but hosted on a subdomain of `gatsbyjs.io` (as opposed to `gtsb.io`).

|              | Old                            | New                                |
| ------------ | ------------------------------ | ---------------------------------- |
| Site         | `build-{UUID}.gtsb.io`         | `build-{UUID}.gatsbyjs.io`         |
| Pull Request | `build-{UUID}.gtsb.io`         | `build-{UUID}.gatsbyjs.io`         |
| Preview      | `preview-{SITEPREFIX}.gtsb.io` | `preview-{SITEPREFIX}.gatsbyjs.io` |

### Are URLs deterministic?

URLs are deterministic besides the UUID generated for a given build. For example, the glob pattern for a Pull Request build would be `build-*.gatsbyjs.io`.
