---
title: "Adding Anchors 🔗 to Gatsby, using Sanity.io"
date: 2019-10-14
author: "ajonp"
excerpt: "Have you ever hunted around for days trying to find that simple package for adding anchor links to your Gatsby blog? It is easier than you might think!"
tags: ["browser-apis", "sanity"]
canonicalLink: https://ajonp.com/blog/anchor-links-from-sanity-in-gatsby
publishedAt: ajonp.com
---

![Gatsby Link](https://res.cloudinary.com/ajonp/image/upload/v1571083718/ajonp-ajonp-com/blog/gatsby-anchor-links/Gatsby_Sanity_Anchor_Links.webp)

# Anchor Links 🔗 from Sanity in Gatsby

> TL;DR version is make sure you implement `onRouteUpdate` and `shouldUpdateScroll` in `gatsby-browser.js`.

## So what is an anchor link?

Anchor links are a way to navigate within the same page in HTML. The easiest way to think of them are like a table of contents, or bookmarks on a page.
You will see anchors used often in markdown pages that have header tags in the form of `#`. Now in order for those normal header tags to have a link they must be wrapped on the front end with a link tag, similar to this: `<a href="#anchor"><h2>Headline Link</h2></a>`. If you inspect the code on this page, you will even see an example of just that, as the blog is written in markdown and converted to HTML.

## Sanity.io

### How does this work with Sanity.io

[Sanity](https://www.sanity.io/) is a headless content based CMS. You write in a [rich text editor](https://www.sanity.io/docs/what-you-need-to-know-about-block-text), which creates [portable text](https://www.portabletext.org/). So unlike markdown you wont have to convert header `#` items but you will have to serialize the portable text into something that Gatsby can understand. I won't dive too deeply into how you create a site using sanity.io there are some [great guides](https://www.gatsbyjs.org/packages/gatsby-source-sanity/?=sanity#gatsby-source-sanity) for that using `gatsby-source-sanity`.

### Extending the Sanity Gatsby blog

Sanity.io's Gatsby [blog example](https://www.sanity.io/guides/the-blog-template), is a great starting point for how to get up and running quickly. You can use that and then extend the functionality however you would like. In the example there is a file for posts which looks similar to below, what we really care about is the line `<div>{_rawBody && <PortableText blocks={_rawBody} />}</div>`.

```tsx
import React from "react"
import PortableText from "./portableText"
import Card from "../Card"

export default props => {
  const { _rawBody, authors, categories } = props
  return (
    <article className="flex flex-col w-full max-w-xl md:max-w-1xl md:max-w-2xl lg:max-w-3xl xl:max-w-6xl m-2 md:max-m-8 md:max-m-8 lg:max-m-8 xl:m-8">
      <div className="w-full">
        <Card {...props} />
      </div>
      <section className="markdown bg-white w-full rounded mt-4 p-4">
        <div>{_rawBody && <PortableText blocks={_rawBody} />}</div>
        <div>
          <aside>
            {categories && (
              <div>
                <h3>Categories</h3>
                <ul>
                  {categories.map(category => (
                    <li key={category._id}>{category.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </article>
  )
}
```

This is a simple react component that uses [@sanity/block-content-to-react](https://github.com/sanity-io/block-content-to-react). The great part here is that they have allowed for serializers and you can add a great deal of customization to any of the block based PortableText that you will be receiving from the graphql from Sanity.io.

```tsx
import React from "react"
import clientConfig from "../../../client-config"
import BasePortableText from "@sanity/block-content-to-react"
import serializers from "../graphql/serializers"

const PortableText = ({ blocks }) => {
  return (
    <BasePortableText
      blocks={blocks}
      serializers={{ ...serializers }}
      {...clientConfig.sanity}
    />
  )
}

export default PortableText
```

### Sanity.io Serializers

The great part about serializers is that you can provide any custom React component that you would like to handle any of the different types that are coming from Sanity.io.

```tsx
import React from "react"
import Figure from "./Figure"
import Code from "./Code"
import Img from "./Img"
import Block from "./Block"

const serializers = {
  types: {
    authorReference: ({ node }) => <span>{node.author.name}</span>,
    mainImage: Figure,
    code: Code,
    img: Img,
    block: Block,
  },
}

export default serializers
```

A fun and simple example is `img` although I could add much of this inline, I plan to use [cloudinary's](http://cloudinary.com) image manipulations to apply affects as I would like to my images. So I added a simple component called `Img` that takes in the node and outputs a simple img tag with corresponding alt text.

```tsx
import React from "react"

export default ({ node }) => {
  const { asset } = node
  return <img src={asset.src} alt={asset.alt} />
}
```

Now the same can hold true for all the `block` type items that appear with portableText. Because we are using Sanity.io's awesome `@sanity/block-content-to-react` we really wouldn't have to do much here, but since again I am a lazy developer I want to make all those headings magically have anchor tags associated, but our portableText looks something like below:

![PortableText showing header tags](https://res.cloudinary.com/ajonp/image/upload/v1571081647/ajonp-ajonp-com/blog/gatsby-anchor-links/Screen_Shot_2019-10-14_at_2.33.46_PM.webp)

So in order to make that happen we added the `block: Block` serializer above which Sanity.io has a great [example](https://github.com/sanity-io/block-content-to-react#customizing-default-serializer-for-block-type) how to setup. My Block looks very similar but it is setting Gatsby Link tags inside each of these headings (well h2 and h3 for now).

```tsx
import React from "react"
import { IoMdLink } from "react-icons/io/"
import { Link } from "gatsby"
const slugs = require(`github-slugger`)()

export default props => {
  slugs.reset()
  const style = props.node.style || "normal"
  // If Heading Level add Anchor Link
  if (typeof location !== `undefined` && /^h\d/.test(style)) {
    const level = style.replace(/[^\d]/g, "")
    const slug = slugs.slug(props.children[0], false)
    switch (level) {
      case "h3":
        return (
          <h3 id={slug} className="flex">
            {props.children}
            <Link to={`${location.pathname}#${slug}`}>
              <div className="py-1 pl-1 rotateIn">
                <IoMdLink />
              </div>
            </Link>
          </h3>
        )
      default:
        return (
          <h2 id={slug} className="flex">
            {props.children}
            <Link to={`${location.pathname}#${slug}`}>
              <div className="py-1 pl-1 rotateIn">
                <IoMdLink />
              </div>
            </Link>
          </h2>
        )
    }
  }

  return style === "blockquote" ? (
    <blockquote>{props.children}</blockquote>
  ) : (
    <p>{props.children}</p>
  )
}
```

## Adding Gatsby Anchor Links

Now even though, Knut Melvær has a great guide called [Internal and external links](https://www.sanity.io/guides/portable-text-internal-and-external-links) that covers in great detail how to add links to your front end, I am a fairly lazy developer and I don't want to manually select and add all of my anchor links so that is why I used the above method. This same approach can be made using markdown files using [gatsby-remark-autolink-headers](https://www.gatsbyjs.org/packages/gatsby-remark-autolink-headers/?=remark).

The one missing piece I found is scrolling to the correct location within the page in Gatsby. In order to do this Gatsby provides some awesome [browser-apis](https://www.gatsbyjs.org/docs/browser-apis/). In order for the scrolling to occur when the page is first loaded we need to use `onRouteUpdate` this will allow us to use the location and check for an existance for `hash` which is our anchor link. I also implemented `shouldUpdateScroll` as selecting an internal link did not trigger a route update, so this was needed without refresh.

gatsby-browser.js

```js
/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it

exports.onRouteUpdate = ({ location }) => {
  anchorScroll(location)
  return true
}
exports.shouldUpdateScroll = ({
  routerProps: { location },
  getSavedScrollPosition,
}) => {
  anchorScroll(location)
  return true
}

function anchorScroll(location) {
  // Check for location so build does not fail
  if (location && location.hash) {
    setTimeout(() => {
      // document.querySelector(`${location.hash}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
      const item = document.querySelector(`${location.hash}`).offsetTop
      const mainNavHeight = document.querySelector(`nav`).offsetHeight
      window.scrollTo({
        top: item - mainNavHeight,
        left: 0,
        behavior: "smooth",
      })
    }, 0)
  }
}
```

## Final result

A nice smooth scrolling screen on refresh and internal link click.

<video controls="controls" autoplay="true" loop="true" width="400">
  <source type="video/mp4" src="https://res.cloudinary.com/ajonp/video/upload/v1571085313/ajonp-ajonp-com/blog/gatsby-anchor-links/anchorScroll.mp4" />
  <source type="video/webm" src="https://res.cloudinary.com/ajonp/video/upload/v1571085313/ajonp-ajonp-com/blog/gatsby-anchor-links/anchorScroll.webm" />
  <p>Your browser does not support the video element.</p>
</video>
