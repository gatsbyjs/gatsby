---
title: Working With Video
---

- [Sourcing video from a host](#sourcing-video-from-a-host)
- [Embedding hosted videos in Markdown](#embedding-hosted-videos-in-markdown)
- [Writing custom components for hosted video](#writing-custom-components-for-hosted-video)
- [Querying video data from Markdown with GraphQL](#querying-video-data-from-markdown-with-graphql)
- [Hosting your own HTML5 video files](#hosting-your-own-html5-video-files)
- [Using custom video players](#using-custom-video-players)

## Sourcing video from a host

The easiest method for including video on a Gatsby site is to source an uploaded file from a site like YouTube, Vimeo, or Twitch. Using the source URL from one of those hosts, you can use Remark plugins or create a custom `<iframe>` solution to embed videos into your Gatsby site.

## Embedding hosted videos in Markdown

There are numerous Gatsby plugins for working with hosted video in your Markdown posts and pages. We recommend checking out the [gatsby-remark-embed-video](/packages/gatsby-remark-embed-video/?=video) plugin for sourcing from a variety of hosts.

### Writing custom components for hosted video

If you would like more control over how YouTube (or similar) videos are embedded into your Gatsby posts and pages, you can write a reusable custom `iframe` component and include it in a JSX template or in your content [with MDX](/docs/mdx/).

In this reusable sample component, you could include props for video data like URL or title, any necessary markup for styling purposes, and the common `iframe` embed code:

```js:title=components/video.js
const Video = ({ videoSrcURL, videoTitle, ...props }) => (
  <div className="video">
    <iframe
      src={videoSrcURL}
      title={videoTitle}
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      frameBorder="0"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
      allowFullScreen
    />
  </div>
)
```

You would then include this component in a template or page with a video source URL and title passed in as props. The data for video URLs and titles can be sourced in multiple ways, such as importing JSON or [querying data from Markdown with GraphQL](#querying-data-from-markdown-with-graphql). You can also hard-code video data for something fun, like a custom 404 page with an Easter egg YouTube video:

```jsx:title=src/pages/404.js
import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Video from "../components/video"

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <section>
      <h1>NOT FOUND</h1>
      <p>You just hit a page that doesn't exist... the sadness.</p>
      <p>May I suggest a video instead?</p>
      <Video
        videoSrcURL="https://www.youtube.com/embed/dQw4w9WgXcQ"
        videoTitle="Official Music Video on YouTube"
      />
    </section>
  </Layout>
)

export default NotFoundPage
```

## Querying video data from Markdown with GraphQL

If a Markdown page or post has a featured video, you might want to include a video URL and title in [its frontmatter](/docs/adding-markdown-pages#note-on-creating-markdown-files). That makes it easy to pass those values into our custom component:

```markdown:title=my-first-post.md
---
path: "/blog/my-first-post"
date: "2019-03-27"
title: "My first blog post"
videoSourceURL: https://www.youtube.com/embed/dQw4w9WgXcQ
videoTitle: "Gatsby is Never Gonna Give You Up"
---
```

To include a video component in a template, you could start with something like this:

```jsx:title=vlog-template.js
import React from "react"
import { graphql } from "gatsby"

import Video from "../components/video"

export default function VlogTemplate({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data // data.markdownRemark holds our post data
  const { frontmatter, html } = markdownRemark
  return (
    <div className="blog-post-container">
      <div className="blog-post">
        <h1>{frontmatter.title}</h1>
        <h2>{frontmatter.date}</h2>
        <Video
          videoSrcURL={frontmatter.videoSrcURL}
          videoTitle={frontmatter.videoTitle}
        />
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        title
        videoSrcURL
        videoTitle
      }
    }
  }
`
```

## Hosting your own HTML5 video files

It's super common to source video from YouTube, Twitch or Vimeo. But what if you want to host your own video and include it as HTML5 video?

> This discussion is ongoing on GitHub, chime in with your ideas in the Gatsby issue [#3346 Create a special component for HTML5 videos](https://github.com/gatsbyjs/gatsby/issues/3346)

To include your own video files that will work in multiple web browsers and platforms, you'll need to read up a bit on video extensions and codecs. We recommend MDN as a resource: [Media formats for HTML audio and video](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats). You may need video converter software to produce the necessary formats to support a range of devices and environments, such as `.webm` and `.mp4`.

## Using custom video players

One advantage of integrating a custom component with your own hosted video is it can give you more control over the video player, including its accessibility. It is strongly encouraged to provide captions and subtitles for your videos, and use a player with accessible controls.

Check out the accessible [HTML5 video player from PayPal](https://github.com/paypal/accessible-html5-video-player#react-version) for an example compatible with Gatsby and React.
