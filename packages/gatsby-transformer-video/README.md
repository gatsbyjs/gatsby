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
- Via SFTP: https://www.gatsbyjs.org/packages/gatsby-plugin-netlify-cache/

# gatsby-plugin-sftp-cache

[![npm](https://img.shields.io/npm/v/gatsby-plugin-sftp-cache.svg?label=npm@latest)](https://www.npmjs.com/package/gatsby-plugin-sftp-cache)
[![npm](https://img.shields.io/npm/v/gatsby-plugin-sftp-cache/canary.svg)](https://www.npmjs.com/package/gatsby-plugin-sftp-cache)
[![npm](https://img.shields.io/npm/dm/gatsby-plugin-sftp-cache.svg)](https://www.npmjs.com/package/gatsby-plugin-sftp-cache)

[![Maintainability](https://api.codeclimate.com/v1/badges/fc81fa5e535561c0a6ff/maintainability)](https://codeclimate.com/github/axe312ger/gatsby-plugin-sftp-cache/maintainability)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

Cache directories in your gatsby project to a remote server to preserve files and speed up deployments via [https://github.com/axe312ger/sftp-cache](sftp-cache)

Works well with https://github.com/axe312ger/gatsby-plugin-netlify-cache, make sure to enable the netlify-cache plugin before the sftp-cache plugin.

## Features

- Download from cache directory and refill it again
- Compare file by missing on other end, modification date, file size and md5 hash
- Keeps file modification date
- Client: Windows, Linux, OSX
- Server: Any host supporting sftp. MD5 hash comparision also needs `md5` or `md5sum` installed on the server.

## Installation

```sh
npm i gatsby-plugin-sftp-cache@canary
```
