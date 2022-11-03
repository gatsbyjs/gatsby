---
title: "Unified Hosting"
description: "Learn about Unified Hosting and the benefits of it in Gatsby Cloud"
---

Unified Hosting (as signalled by a `gatsbyjs.io` domain) is enabled by default on production builds. Starting November 17, 2022, Unified Hosting will be enabled for all builds in a gradual rollout, and will be finished on November 24, 2022.

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

Unified Hosting is the current infrastructure for Production builds. This brings all of the [benefits](#benefits) above to all builds (including Pull Request and Preview builds). Gatsby is "unifying" all infrastructure to this faster, more modern architecture.

### What is the impact?

The major change that will occur when Unified Hosting is deployed is a difference in individual build URLs. Previously, these builds were deployed to a `gtsb.io` domain. After this rollout, all builds will be deployed to a `gatsbyjs.io` domain.

### Will old `gtsb.io` URLs continue to work?

Yes, any builds deployed before this rollout will continue to work on the `gtsb.io` domain.

### What will new URLs look like?

The new URLs will be the same format, but hosted on a subdomain of `gatsbyjs.io` (as opposed to `gtsb.io`).

|              | Old                            | New                                |
| ------------ | ------------------------------ | ---------------------------------- |
| Site         | `build-{UUID}.gtsb.io`         | `build-{UUID}.gatsbyjs.io`         |
| Pull Request | `build-{UUID}.gtsb.io`         | `build-{UUID}.gatsbyjs.io`         |
| Preview      | `preview-{SITEPREFIX}.gtsb.io` | `preview-{SITEPREFIX}.gatsbyjs.io` |

### Are URLs deterministic?

URLs are deterministic besides the UUID generated for a given build. For example, the glob pattern for a Pull Request build would be `build-*.gatsbyjs.io`.

### When will Unified Hosting be live on my site?

Unified Hosting will begin rolling out for all builds on November 17, 2022. Sites on a Free plan will receive unified hosting first, followed by Professional, and then Enterprise. All sites are anticipated to have Unified Hosting on November 24, 2022.
