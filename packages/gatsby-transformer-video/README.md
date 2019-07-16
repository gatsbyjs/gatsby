# gatsby-transformer-video

Convert videos into well supported formats via FFMPEG. Supports generating previews as well.

:warning: Converting videos might take a lot of time. Make sure to have a effective caching mechanism in place. See [caching](#caching)

## Features

- Supports file nodes & Contentful assets
- Defaults optimized for small files with high visual quality
- Convert videos to h264 and h265
- Create animated previews as mp4, animated webp and animated gif.
- Add watermarks to you videos
- More?

## Installation

```sh
npm i gatsby-transformer-video
```

## Usage

`gatsby-config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-video`,
      options: {
        // @todo
      },
    },
  ],
}
```

```graphql
query {
  allFile {
    edges {
      node {
        id
        videoPreview(duration: 2, fps: 3, maxWidth: 600) {
          gif
          mp4
          webp
        }
        video(
          overlay: "gatsby.png"
          overlayX: "end"
          overlayY: "start"
          overlayPadding: 25
        ) {
          h264
          h265
        }
      }
    }
  }
  allContentfulAsset {
    edges {
      node {
        id
        videoPreview(width: 600, fps: 4, duration: 3) {
          mp4
          webp
          gif
        }
        video {
          h264
          h265
        }
      }
    }
  }
}
```

## Caching

You should cache

- Netlify: https://www.gatsbyjs.org/packages/gatsby-plugin-netlify-cache/
- Via SFTP: https://www.gatsbyjs.org/packages/gatsby-plugin-sftp-cache/
