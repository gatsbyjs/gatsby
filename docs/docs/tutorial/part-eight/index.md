---
title: Preparing a Site to Go Live
typora-copy-images-to: ./
disableTableOfContents: true
---

Wow! You've come a long way! You've learned how to:

- create new Gatsby sites
- create pages and components
- style components
- add plugins to a site
- source & transform data
- use GraphQL to query data for pages
- programmatically create pages from your data

In this final section, you're going to walk through some common steps for preparing a site to go live by introducing a powerful site diagnostic tool called [Lighthouse](https://developers.google.com/web/tools/lighthouse/). Along the way, we'll introduce a few more plugins you'll often want to use in your Gatsby sites.

## Audit with Lighthouse

Quoting from the [Lighthouse website](https://developers.google.com/web/tools/lighthouse/):

> Lighthouse is an open-source, automated tool for improving the quality of web pages. You can run it against any web page, public or requiring authentication. It has audits for performance, accessibility, progressive web apps (PWAs), and more.

Lighthouse is included in Chrome DevTools. Running its audit -- and then addressing the errors it finds and implementing the improvements it suggests -- is a great way to prepare your site to go live. It helps give you confidence that your site is as fast and accessible as possible.

Try it out!

First, you need to create a production build of your Gatsby site. The Gatsby development server is optimized for making development fast but the site that it generates, while closely resembling a production version of the site, isn't as optimized.

### ✋ Create a production build

1. Stop the development server (if it's still running) and run the following command:

```shell
gatsby build
```

> 💡 As you learned in [part 1](/docs/tutorial/part-one/), this does a production build of your site and outputs the built static files into the `public` directory.

2. View the production site locally. Run:

```shell
gatsby serve
```

Once this starts, you can view your site at `http://localhost:9000`.

### Run a Lighthouse audit

Now you're going to run your first Lighthouse test.

1. If you haven't already done so, open the site in Chrome Incognito Mode so no extensions interfere with the test. Then, open up the Chrome DevTools.

2. Click on the "Lighthouse" tab where you'll see a screen that looks like:

![Lighthouse audit start](./lighthouse-audit.png)

3. Click "Generate report" (All available audit types should be selected by default). (It'll then take a minute or so to generate the report). Once the report is complete, you should see results that look like this:

![Lighthouse audit results](./lighthouse-audit-results.png)

As you can see, Gatsby's performance is excellent out of the box but you're missing some things for PWA, Accessibility, Best Practices, and SEO that will improve your scores (and in the process make your site much more friendly to visitors and search engines).

## Add a manifest file

Looks like you have a pretty lackluster score in the "Progressive Web App" category. Let's address that.

But first, what exactly _are_ PWAs?

They are regular websites that take advantage of modern browser functionality to augment the web experience with app-like features and benefits. Check out [Google's overview](https://developers.google.com/web/progressive-web-apps/) of what defines a PWA experience.

Inclusion of a web app manifest is one of the three generally accepted [baseline requirements for a PWA](https://alistapart.com/article/yes-that-web-project-should-be-a-pwa#section1).

Quoting [Google](https://developers.google.com/web/fundamentals/web-app-manifest/):

> The web app manifest is a simple JSON file that tells the browser about your web application and how it should behave when 'installed' on the user's mobile device or desktop.

[Gatsby's manifest plugin](/plugins/gatsby-plugin-manifest/) configures Gatsby to create a `manifest.webmanifest` file on every site build.

### ✋ Using `gatsby-plugin-manifest`

1. Install the plugin:

```shell
npm install gatsby-plugin-manifest
```

2. Add a favicon for your app under `src/images/icon.png`. For the purposes of this tutorial you can use [this example icon](https://raw.githubusercontent.com/gatsbyjs/gatsby/master/docs/docs/tutorial/part-eight/icon.png), should you not have one available. The icon is necessary to build all images for the manifest. For more information, look at the docs for [`gatsby-plugin-manifest`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-manifest/README.md).

3. Add the plugin to the `plugins` array in your `gatsby-config.js` file.

```javascript:title=gatsby-config.js
{
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `GatsbyJS`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#6b37bf`,
        theme_color: `#6b37bf`,
        // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
        // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: `standalone`,
        icon: `src/images/icon.png`, // This path is relative to the root of the site.
      },
    },
  ]
}
```

That's all you need to get started with adding a web manifest to a Gatsby site. The example given reflects a base configuration -- Check out the [plugin reference](/plugins/gatsby-plugin-manifest/?=gatsby-plugin-manifest#automatic-mode) for more options.

## Add page metadata

Adding metadata to pages (such as a title or description) is key in helping search engines like Google understand your content and decide when to surface it in search results.

[React Helmet](https://github.com/nfl/react-helmet) is a package that provides a React component interface for you to manage your [document head](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head).

Gatsby's [react helmet plugin](/plugins/gatsby-plugin-react-helmet/) provides drop-in support for server rendering data added with React Helmet. Using the plugin, attributes you add to React Helmet will be added to the static HTML pages that Gatsby builds.

### ✋ Using `React Helmet` and `gatsby-plugin-react-helmet`

1. Install both packages:

```shell
npm install gatsby-plugin-react-helmet react-helmet
```

2. Make sure you have a `description` and an `author` configured inside your `siteMetadata` object. Also, add the `gatsby-plugin-react-helmet` plugin to the `plugins` array in your `gatsby-config.js` file.

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Pandas Eating Lots`,
    // highlight-start
    description: `A simple description about pandas eating lots...`,
    author: `gatsbyjs`,
    // highlight-end
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `GatsbyJS`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#6b37bf`,
        theme_color: `#6b37bf`,
        // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
        // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: `standalone`,
        icon: `src/images/icon.png`, // This path is relative to the root of the site.
      },
    },
    // highlight-next-line
    `gatsby-plugin-react-helmet`,
  ],
}
```

3. In the `src/components` directory, create a file called `seo.js` and add the following:

```jsx:title=src/components/seo.js
import React from "react"
import PropTypes from "prop-types"
import { Helmet } from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"

function SEO({ description, lang, meta, title }) {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
          }
        }
      }
    `
  )

  const metaDescription = description || site.siteMetadata.description

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.author,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
      ].concat(meta)}
    />
  )
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
}

export default SEO
```

The above code sets up defaults for your most common metadata tags and provides you an `<SEO>` component to work within the rest of your project. Pretty cool, right?

4. Now, you can use the `<SEO>` component in your templates and pages and pass props to it. For example, add it to your `blog-post.js` template like so:

```jsx:title=src/templates/blog-post.js
import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
// highlight-next-line
import SEO from "../components/seo"

export default function BlogPost({ data }) {
  const post = data.markdownRemark
  return (
    <Layout>
      // highlight-start
      <SEO title={post.frontmatter.title} description={post.excerpt} />
      // highlight-end
      <div>
        <h1>{post.frontmatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
      // highlight-next-line
      excerpt
    }
  }
`
```

The above example is based off the [Gatsby Starter Blog](/starters/gatsbyjs/gatsby-starter-blog/). By passing props to the `<SEO>` component, you can dynamically change the metadata for a post. In this case, the blog post `title` and `excerpt` (if it exists in the blog post markdown file) will be used instead of the default `siteMetadata` properties in your `gatsby-config.js` file.

Now, if you run the Lighthouse audit again as laid out above, you should get close to--if not a perfect-- 100 score!

> 💡 For further reading and examples, check out [Adding an SEO Component](/docs/add-seo-component/) and the [React Helmet docs](https://github.com/nfl/react-helmet#example)!

## Keep making it better

In this section, we've shown you a few Gatsby-specific tools to improve your site's performance and prepare to go live.

Lighthouse is a great tool for site improvements and learning -- Continue looking through the detailed feedback it provides and keep making your site better!

## Next Steps

### Official Documentation

- [Official Documentation](/docs/): View our Official Documentation for step-by-step [How-To Guides](/docs/how-to/), big-picture [Conceptual Guides](/docs/conceptual), and technical [Reference Guides](/docs/reference).

### Official Plugins

- [Official Plugins](https://github.com/gatsbyjs/gatsby/tree/master/packages): The complete list of all the Official Plugins maintained by Gatsby.

### Official Starters

1. [Gatsby's Default Starter](https://github.com/gatsbyjs/gatsby-starter-default): Kick off your project with this default boilerplate. This barebones starter ships with the main Gatsby configuration files you might need. _[working example](https://gatsbyjs.github.io/gatsby-starter-default/)_
2. [Gatsby's Blog Starter](https://github.com/gatsbyjs/gatsby-starter-blog): Gatsby starter for creating an awesome and blazing-fast blog. _[working example](https://gatsbyjs.github.io/gatsby-starter-blog/)_
3. [Gatsby's Hello-World Starter](https://github.com/gatsbyjs/gatsby-starter-hello-world): Gatsby Starter with the bare essentials needed for a Gatsby site. _[working example](https://gatsby-starter-hello-world-demo.netlify.app/)_

## That's all, folks

Well, not quite; just for this tutorial. There are additional [How-To Guides](/docs/how-to/) to check out for more guided use cases.

This is just the beginning. Keep going!

- Did you build something cool? Share it on Twitter, tag [#buildwithgatsby](https://twitter.com/search?q=%23buildwithgatsby), and [@mention us](https://twitter.com/gatsbyjs)!
- Did you write a cool blog post about what you learned? Share that, too!
- Contribute! Take a stroll through [open issues](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) on the gatsby repo and [become a contributor](/contributing/how-to-contribute/).

Check out the ["how to contribute"](/contributing/how-to-contribute/) docs for even more ideas.

We can't wait to see what you do! 😄
