---
date: "2019-01-09"
title: "Search Engine Optimization with Gatsby"
author: Dustin Schau
cover: images/seo.jpg
excerpt: "Learn how to use Gatsby to implement SEO with React Helmet and smart defaults!"
tags:
  - javascript
  - react
  - seo
---

Search Engine Optimization (hereafter SEO) is something you should be considering. Perhaps you've even been approached by an SEO _expert_ who can maximize your revenue and page views just by following these **Three Simple Tricks**! However, relatively few make the concerted effort to implement SEO in their web app. In this post, I'll share some of the ins and outs of SEO and how you can implement common, simple SEO patterns in your Gatsby web app, today. By the end of this post you'll know how to do the following:

- Implement SEO patterns with [react-helmet][react-helmet]
- Create an optimized social sharing card for Twitter, Facebook, and Slack
- Tweak the SEO component exposed in the default gatsby starter ([`gatsby-starter-default`][gatsby-starter-default])

## Implementation

The core technology powering SEO is the humble, ubiquitiuous `meta` tag along with common tags like `title`. You've probably seen something like the below:

```html
<title>My Wonderful App</title>
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, shrink-to-fit=no"
/>
<meta
  name="description"
  content="This is probably some earth-shattering excerpt that is around ~200 characters or less"
/>
```

These are the _bare minimum_ requirements that should be implemented within an application's `head` tags for simple and basic SEO. However--we can go further with the powerful combo of content rendered at _build time_ powered by Gatsby and GraphQL. Let's dive in.

## Gatsby + GraphQL

GraphQL is a crucial feature enabled via Gatsby (note: you don't [_have_ to use GraphQL with Gatsby][unstructured-data]). Leveraging GraphQL to query your indexable content--wherever it lives (at build time!)--is one of the most powerful and flexible techniques enabled via Gatsby. Let's briefly look at how we can implement an extensible and flexible SEO component.

### `StaticQuery`

Gatsby distinguishes between page-level queries and component queries. The former can use page GraphQL queries while the latter can use a new in Gatsby v2 feature called [`StaticQuery`][gatsby-static-query]. A StaticQuery will be parsed, evaluated, and injected at _build time_ into the component that is requesting the data. We can use the data from this query to fall back to sane defaults, while also providing an extensible, reusable component.

### Creating the SEO component

Using the power and flexibility of React, we can create a React component to power this functionality.

> Note: `react-helmet` is enabled, by default, in gatsby-starter-default and gatsby-starter-blog
>
> If you're not using those starters [follow this guide for installation instructions][gatsby-plugin-react-helmet]

```jsx:title=src/components/seo.js
import React from "react"
// highlight-start
import Helmet from "react-helmet"
import { StaticQuery, graphql } from "gatsby"
// highlight-end

function SEO() {
  return (
    <StaticQuery
      query={graphql`
        # highlight-start
        {
          site {
            siteMetadata {
              description
              keywords
              siteUrl
            }
          }
        }
        # highlight-end
      `}
      render={data => null}
    />
  )
}

export default SEO
```

This component doesn't _do_ anything yet, but we're laying the foundation for a useful, extensible component. What we've done up to this point is leverage the `StaticQuery` functionality enabled via Gatsby to query our siteMetadata (e.g. details in `gatsby-config.js`) so that we can grab description and keywords.

The `StaticQuery` component accepts a render prop, and at this point, we're simply returning `null` to render nothing. Let's _actually_ render something and build out our prototype for this SEO component. Let's iterate further.

```jsx:title=src/components/seo.js
import React from "react"
import Helmet from "react-helmet"
import { StaticQuery, graphql } from "gatsby"

function SEO() {
  return (
    <StaticQuery
      query={graphql`
        {
          site {
            siteMetadata {
              author
              description
              siteUrl
            }
          }
        }
      `}
      render={data => (
        <Helmet
          htmlAttributes={{
            lang: "en",
          }}
          meta={
            // highlight-start
            [
              {
                name: "description",
                content: data.site.siteMetadata.description,
              },
            ]
            // highlight-end
          }
        />
      )}
    />
  )
}

export default SEO
```

Whew, getting closer! This will now render the `meta` `description` tag, and will do so using content injected at build-time with the `StaticQuery` component. Additionally, it will add the `lang="en"` attribute to our root-level `html` tag to silence that pesky Lighthouse warning 😉

If you remember earlier, I claimed this was the bare bones, rudimentary approach to SEO, and that still holds true. Let's enhance this functionality and get some useful functionality for sharing a page via social networks like Facebook, Twitter, and Slack.

### Implementing social SEO

In addition to SEO for actual _search_ engines we also want those pretty cards that social networks like Twitter and Slack enable. Specifically, we'd like to implement the following:

- Description for embedded results
- Title for embedded results
- (Optionally) display an image and a card if an image is passed in to the component

Let's implement it 👌

```jsx:title=src/components/seo.js
import React from "react"
import Helmet from "react-helmet"
import PropTypes from "prop-types" // highlight-line
import { StaticQuery, graphql } from "gatsby"

// highlight-next-line
function SEO({ description, meta, image: metaImage, title }) {
  return (
    <StaticQuery
      query={graphql`
        {
          site {
            siteMetadata {
              author
              description
              siteUrl
              keywords
            }
          }
        }
      `}
      render={data => {
        // highlight-start
        const metaDescription =
          description || data.site.siteMetadata.description
        const image =
          metaImage && metaImage.src
            ? `${data.site.siteMetadata.siteUrl}${metaImage.src}`
            : null
        // highlight-end
        return (
          <Helmet
            htmlAttributes={{
              lang: "en",
            }}
            title={title}
            meta={
              [
                {
                  name: "description",
                  content: metaDescription,
                },
                {
                  name: "keywords",
                  content: data.site.siteMetadata.keywords.join(","),
                },
                // highlight-start
                {
                  property: "og:title",
                  content: title,
                },
                {
                  property: "og:description",
                  content: metaDescription,
                },
                {
                  name: "twitter:creator",
                  content: data.site.siteMetadata.author,
                },
                {
                  name: "twitter:title",
                  content: title,
                },
                {
                  name: "twitter:description",
                  content: metaDescription,
                },
              ]
                .concat(
                  metaImage
                    ? [
                        {
                          property: "og:image",
                          content: image,
                        },
                        {
                          property: "og:image:width",
                          content: metaImage.width,
                        },
                        {
                          property: "og:image:height",
                          content: metaImage.height,
                        },
                        {
                          name: "twitter:card",
                          content: "summary_large_image",
                        },
                      ]
                    : [
                        {
                          name: "twitter:card",
                          content: "summary",
                        },
                      ]
                )
                .concat(meta)
              // highlight-end
            }
          />
        )
      }}
    />
  )
}

// highlight-start
SEO.defaultProps = {
  meta: [],
}
// highlight-end

// highlight-start
SEO.propTypes = {
  description: PropTypes.string,
  image: PropTypes.shape({
    src: PropTypes.string.isRequired(),
    height: PropTypes.string.isRequired(),
    width: PropTypes.string.isRequired(),
  }),
  meta: PropTypes.array,
  title: PropTypes.string.isRequired,
}
// highlight-end

export default SEO
```

Woo hoo! What we've done up to this point is enabled not only SEO for search engines like Google, Bing (people use Bing, right?) but we've also laid the groundwork for enhanced sharing capabilities on social networks. That's a win-win if I've ever seen one 😍 Finally, we need to add support for one of the more useful functionalities for SEO, specifically a canonical link.

## `link rel="canonical"`

A canonical link is a hint to a search engine that this is the _source_ for this content. It helps resolve duplicate content issues. For instance, if you have several paths to the same content, you can use a canonical link as akin to a soft redirect which will **not** harm your search ranking if implemented correctly.

To implement this functionality, we will need to:

1. Enable passing a `pathname` prop to our SEO component
1. Prefix our `pathname` prop with our `siteUrl` (from `gatsby-config.js`)
   - A canonical link should be _absolute_ (e.g. https://your-site.com/canonical-link), so we will need to prefix with this `siteUrl`
1. Tie into the `link` prop of `react-helmet` to create a `<link rel="canonical" >` tag

```jsx
import React from "react"
import Helmet from "react-helmet"
import PropTypes from "prop-types"
import { StaticQuery, graphql } from "gatsby"

// highlight-next-line
function SEO({ description, meta, image: metaImage, slug, title }) {
  return (
    <StaticQuery
      query={graphql`
        {
          site {
            siteMetadata {
              author
              description
              siteUrl
              keywords
            }
          }
        }
      `}
      render={data => {
        const metaDescription =
          description || data.site.siteMetadata.description
        const image =
          metaImage && metaImage.src
            ? `${data.site.siteMetadata.siteUrl}${metaImage.src}`
            : null
        // highlight-next-line
        const canonical = pathname
          ? `${data.site.siteMetadata.siteUrl}${slug}`
          : null
        return (
          <Helmet
            htmlAttributes={{
              lang: "en",
            }}
            title={title}
            link={
              // highlight-start
              canonical
                ? [
                    {
                      rel: "canonical",
                      href: canonical,
                    },
                  ]
                : []
              //highlight-end
            }
            meta={[
              {
                name: "description",
                content: metaDescription,
              },
              {
                name: "keywords",
                content: data.site.siteMetadata.keywords.join(","),
              },
              {
                property: "og:title",
                content: title,
              },
              {
                property: "og:description",
                content: metaDescription,
              },
              {
                name: "twitter:creator",
                content: data.site.siteMetadata.author,
              },
              {
                name: "twitter:title",
                content: title,
              },
              {
                name: "twitter:description",
                content: metaDescription,
              },
            ]
              .concat(
                metaImage
                  ? [
                      {
                        property: "og:image",
                        content: image,
                      },
                      {
                        property: "og:image:width",
                        content: metaImage.width,
                      },
                      {
                        property: "og:image:height",
                        content: metaImage.height,
                      },
                      {
                        name: "twitter:card",
                        content: "summary_large_image",
                      },
                    ]
                  : [
                      {
                        name: "twitter:card",
                        content: "summary",
                      },
                    ]
              )
              .concat(meta)}
          />
        )
      }}
    />
  )
}

SEO.defaultProps = {
  meta: [],
}

SEO.propTypes = {
  description: PropTypes.string,
  image: PropTypes.shape({
    src: PropTypes.string.isRequired(),
    height: PropTypes.string.isRequired(),
    width: PropTypes.string.isRequired(),
  }),
  meta: PropTypes.array,
  // highlight-next-line
  slug: PropTypes.string,
  title: PropTypes.string.isRequired,
}

export default SEO
```

Woo hoo! Lot to digest here, but we've enabled adding an _absolute_ canonical link simply my passing in a `slug` prop and prefixing with our `siteUrl`.

To bring it all home, it's high time to begin actually _using_ this extensible SEO component to show all of these moving parts coming together to deliver a great SEO experience.

## Using the SEO component

We now have our extensible SEO component. It takes a `title` prop, and then (optionally) `description`, `meta`, `image`, and `pathname` props. Let's wire it all up!

### In a page component

```jsx:title=src/pages/index.js
import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo" // highlight-line

function Index() {
  return (
    <Layout>
      <SEO title="My Amazing Gatsby App" /> {/* highlight-line */}
      <h1>lol - pretend this is meaningful content</h1>
    </Layout>
  )
}

export default Index
```

### In a template

Let's pretend we have a Markdown powered blog (see: [this tutorial][gatsby-markdown-blog] for more info). We--of course--want some nice SEO as well as a nifty image for sharing on Twitter, Facebook, and Slack. We're going to do this with a few steps, specifically:

- Create a Markdown post
- Add an image, and add it to the Markdown posts frontmatter
- Query this image with GraphQL

#### Creating the post

```shell
mkdir -p content/blog/2019-01-04-hello-world-seo
touch content/blog/2019-01-04-hello-world-seo/index.md
```

```md:title=content/blog/2019-01-04-hello-world-seo/index.md
---
date: 2019-01-04
featured: images/featured.jpg
---

Hello World!
```

#### Adding the image

Feel free to add whatever, or perhaps use this _very pertinent_ image:

![Sample Image](./images/seo.jpg)

the image will need to be located at `content/blog/2019-01-04-hello-world-seo/images/featured.jpg`

#### Querying with GraphQL

```jsx:title=src/templates/blog-post.js
import React from 'react'
import { graphql } from 'gatsby'

import Layout from '../components/layout'
import SEO from '../components/seo' // highlight-line

// highlight-start
function BlogPost({ data, location }) {
  const { markdown: { excerpt, html, fields, frontmatter } } = data
  const image = frontmatter.image ? frontmatter.image.childImageSharp.resize : null
  // highlight-end
  return (
    <Layout>
      {/* highlight-start */}
      <SEO title="My Amazing Gatsby App" description={excerpt} image={image} pathname={fields.slug}>
      /* highlight-end */}
      <h1>{frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Layout>
  )
}

export const blogPostQuery = graphql`
  # highlight-start
  query BlogPostBySlug($slug: String!) {
    markdown: markdownRemark(fields: { $slug: { eq: $slug }}) {
      html
      excerpt(pruneLength: 160)
      fields {
        slug
      }
      frontmatter {
        image: featured {
          childImageSharp {
            resize(width: 1200) {
              src
              height
              width
            }
          }
        }
        title
      }
    }
  }
  # highlight-end
`

export default BlogPost
```

There are a few aspects worth nothing here:

1. We're using `pruneLength: 160` for the excerpt; this is because [SEO meta descriptions should be between 150-170 characters][seo-description-length]

- This is a slick feature of Gatsby's GraphQL capabilities, and will truncate (e.g. with a trailing `...`) appropriately. Perfect!

1. The image querying is intentionally simplified, but a good base to build upon. There are specific size and aspect ratio requirements for [both Facebook][facebook-og-image] and [Twitter][twitter-image].

## The Payoff

Using the techniques outlined in this post, we've made our Gatsby application SEO-friendly as well as sharable on common social networks. Don't just take _my_ word for it, though--check out the following examples of a sample blog post.

### Google

![Google](./images/google.png)

### Facebook

![Facebook](./images/facebook.png)

### Twitter

![Twitter](./images/twitter.png)

### Slack

![Slack](./images/slack.png)

To learn more about these validations were created, check out how to _validate_ SEO with the following tools from [Google][google-validation], [Twitter][twitter-validation], and [Facebook][facebook-validation].

These SEO resources outlined in this post aren't _only_ a best practice, they're also a best practice enabled, by default. Available **today** in `gatsby-starter-default`, simply use:

```shell
npx gatsby new my-new-gatsby-app
```

and you'll have the `SEO` component available to maximize your SEO and social sharing capabilities. Check it out!

## Further Learning

This article is merely a shallow dive into the depths of SEO optimization--consider it a primer for further learning and a gentle introduction to some SEO concepts with a Gatsby twist. To truly master these concepts is outside the scope of this article, but it truly is fascinating stuff that can directly lead to more eyes on your content!

Thanks for reading--I cannot wait to see what you build next. 💪

### References

- Facebook uses the [Open Graph][og] tag format
- Twitter uses `twitter:` keywords. See [Twitter Cards][twitter-cards] for more info
- Slack reads tags in the following order ([source][slack-unfurl])
  1. oEmbed server
  1. Twitter cards tags / Facebook Open Graph tags
  1. HTML meta tags
- Both [Google][google-json-ld] and [Apple][apple-json-ld] offer support for JSON-LD, which is _not covered_ in this guide
  - If you'd like to learn more, check out [this excellent guide](https://nystudio107.com/blog/json-ld-structured-data-and-erotica) for more info on JSON-LD
- Check out the [`gatsby-seo-example`][gatsby-seo-example] for a ready-to-use starter for powering your Markdown-based blog.

[gatsby-starter-default]: https://github.com/gatsbyjs/gatsby-starter-default
[gatsby-static-query]: https://www.gatsbyjs.org/docs/static-query/
[gatsby-markdown-blog]: https://www.gatsbyjs.org/docs/adding-markdown-pages/
[gatsby-plugin-react-helmet]: https://www.gatsbyjs.org/packages/gatsby-plugin-react-helmet/
[react-helmet]: https://github.com/nfl/react-helmet
[unstructured-data]: https://www.gatsbyjs.org/docs/using-unstructured-data/
[og]: https://developers.facebook.com/docs/sharing/webmasters/#markup
[twitter-cards]: https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/abouts-cards.html
[seo-description-length]: https://yoast.com/shorter-meta-descriptions/
[facebook-og-image]: https://developers.facebook.com/docs/sharing/best-practices#images
[twitter-image]: https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/summary-card-with-large-image.html
[slack-unfurl]: https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254
[google-validation]: https://support.google.com/webmasters/answer/6066468?hl=en
[twitter-validation]: https://cards-dev.twitter.com/validator
[facebook-validation]: https://developers.facebook.com/tools/debug/sharing
[gatsby-seo-example]: https://github.com/DSchau/gatsby-seo-example
[google-json-ld]: https://developers.google.com/search/docs/guides/intro-structured-data
[apple-json-ld]: https://developer.apple.com/library/archive/releasenotes/General/WhatsNewIniOS/Articles/iOS10.html#//apple_ref/doc/uid/TP40017084-DontLinkElementID_2
