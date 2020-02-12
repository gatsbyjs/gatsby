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

## Prerequisites

You will need to install `ffmpeg` and `ffprobe` as well.

Go to https://ffmpeg.org/download.html and download either a shared or static version of the library.

Some operating systems may provide these packages via package manager. Some may **not provide** `ffprobe` when installing `ffmpeg`.

You can either:

- Provide the path to ffmpeg && ffprobe via GatsbyJS plugin configuration
- Set an environment variable -> https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#ffmpeg-and-ffprobe
- Add the static binaries to any folder in your `$PATH`

### Linux

Linux users might be able to: `sudo apt-get install ffmpeg`

Make sure you have `ffprobe` installed as well.

### OSX

I could not figure out how to use `brew` to install ffprobe as well

## Usage

`gatsby-config.js`:

```js
const { resolve } = require(`path`)
const { platform } = require(`os`)
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-video`,
      options: {
        // Assumes you store your binaries in the following pattern:
        // * ./bin/darwin/ffmpeg
        // * ./bin/darwin/ffprobe
        // * ./bin/linux/ffmpeg
        // * ./bin/linux/ffprobe
        // * ...
        ffmpegPath: resolve(__dirname, "bin", platform(), "ffmpeg"),
        ffprobePath: resolve(__dirname, "bin", platform(), "ffprobe"),
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

Generating videos take time. A lot. You should cache your results, otherwise you might not even be able to publish on your hosting platform.

Here is a list of plugins that can help you:

- Netlify: https://www.gatsbyjs.org/packages/gatsby-plugin-netlify-cache/
- Via SFTP: https://www.gatsbyjs.org/packages/gatsby-plugin-sftp-cache/
- Gatsby Cloud should work well to store the generated files
- We could write a caching plugin using a node p2p network like https://dat.foundation/ to eventually eliminate the need of a server for caching generated files
