---
title: Image CDN
description: Documentation on what Image CDN is and how it is used
---

Image CDN is a new feature of Hosting on Gatsby Cloud. Instead of processing images at build time, Image CDN defers and offloads image processing to the edge.

### Key benefits:

Significantly faster build times by offloading and deferring image processing
Improved front-end performance (about 300ms faster for media-rich pages)
Better SEO since images are served from your site’s origin domain
Save time when developing locally since image processing is deferred to runtime.
Together, these features improve developer and content editor productivity. Developers get faster builds, and content editors can ship content changes faster.

### How does Image CDN work?

Much like DSG, images processing is deferred to runtime. The first request for an image will be marginally slower than subsequent requests. After initial request, images are cached on Gatsby Cloud’s Global Edge Network.

### Who can use Image CDN?

Image CDN is free for all Gatsby Cloud customers.

### Plan Limits

Bandwidth and requests for serving images on Gatsby Cloud's Global Edge Network count against your workspace's plan allotments. Limits are based on the number of original images being processed.

| Tier         | Limit |
| ------------ | ----- |
| Free         | 100   |
| Professional | 5000  |
| Standard     | 5000  |
| Performance  | 5000  |
| Agency       | 5000  |
| Enterprise   | 10000 |

### Will my site go down when I enable Image CDN?

No. Image CDN and image processing at the edge impacts subsequent builds. Since Gatsby Cloud Hosting is atomic, your site will not experience any downtime.

### Image CDN limitations

Image CDN requires Gatsby 4, specific source plugin versions, and may require you modify your site’s GraphQL queries. Image CDN only fully works on sites hosted on Gatsby cloud and doesn't work with other hosting integrations. When using the new gatsbyImage GraphQL field on hosts besides Gatsby Cloud, Gatsby will fetch and process images at build time - image processing will not be deferred to our CDN.

### How to Enable Image CDN

[Visit our How To Guide to Learn How to Enable](/docs/how-to/cloud/enable-image-cdn/)
