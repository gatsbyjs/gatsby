---
date: "2022-03-29"
version: "4.11.0"
title: "v4.11 Release Notes"
---

Welcome to `gatsby@4.11.0` release (March 2022 #3)

Key highlights of this release:

- [`gatsby-source-shopify` v7](#gatsby-source-shopify-v7)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.10)

[Full changelog][full-changelog]

---

## `gatsby-source-shopify` v7

Enjoy better Gatsby and Shopify intergration! In `gatsby-source-shopify` v7, we did a rewrite on major areas of the plugin while addressing issues on [product media](https://github.com/gatsbyjs/gatsby/discussions/32832), [presentmentPrices](https://github.com/gatsbyjs/gatsby/discussions/32090) among others. We also added support for `ProductCollectionSortKeys` and `ProductImageSortKeys`.

Here's a list of notable improvements in this release:

#### Product Media

Previously, you could only get product images through the `product.images` field. This made it impossible to get product videos or 3D Models. In v7, you can now access product videos or 3D models via `product.media`

#### Correct Reference Order

Previously, because of the way that we were referencing child fields, we were unable to guarantee the correct order of children (variants, images, etc). We now fetch the order from Shopify to gurantee corretness.

#### Single Metafield type

To keep in line with the shopify Admin API Schema, we switched to having a single Metafield type as opposed to multiple "{parent}Metafield" types.

#### Added presentmentPrices

Previously, because of the way that we were parsing the results return by the Shopify Bulk API we were unable to fetch presentment prices. With the new method of parsing results we were able to, so that field is now available on product variants.

#### Explicit TypeDefs

We decided to add the complete schema to this plugin and disable schema inference, which allows us to account for the possibility that there are no products in Shopify or that a field is null without breaking every page on the site due to schema inference.

#### Match API Schema

The Gatsby schema for the plugin matches the Shopify Admin API schema ~95%. This allows us to refer to the Shopify documentation for the majority of fields rather than having to create separate documentation to consume the same data.

## Notable bugfixes & improvements

- `gatsby`
  - Fix compatibility issues with `react@18.0.0-rc.2`, via [PR #35108](https://github.com/gatsbyjs/gatsby/pull/35108)
  - Fix eperm issue on windows when clearing cache, via [PR #35154](https://github.com/gatsbyjs/gatsby/pull/35154)
  - Improve functions compilation error, via [PR #35196](https://github.com/gatsbyjs/gatsby/pull/35196)
- `gatsby-plugin-utils`: Support aspect ratio for Image Service, via [PR #35087](https://github.com/gatsbyjs/gatsby/pull/35087)
- `gatsby-source-mogodb`: Add optional `typePrefix` option to override dbName, via [PR #35087](https://github.com/gatsbyjs/gatsby/pull/35087)
- `gatsby-cli`: Resolve babel preset ts explicitly, via [PR #35153](https://github.com/gatsbyjs/gatsby/pull/35153)
- `gatsby-plugin-preact`: Fix preact alias via [PR #35196](https://github.com/gatsbyjs/gatsby/pull/35156)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.11.0-next.0...gatsby@4.11.0
