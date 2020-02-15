# gatsby-transformer-video

> Convert videos via FFMPEG. Easily convert & host **small** videos on your own.

:warning: Converting videos might take a lot of time. Make sure to have an effective caching mechanism in place. See [caching](#caching)

## Features

- Source: Works with nodes from `gatsby-source-filesystem` and `gatsby-source-contentful`
- Defaults optimized for small files with decent quality and quick and seamless streaming
- Supported codecs: h264, h265, VP9, WebP & gif
- Several parameters to tweak the output: maxWidth/maxHeight, overlay, saturation, duration, fps, ...
- Create video conversion profiles. Create a converter function using `fluent-ffmpeg` to unlock all FFMPEG features.
- Take screenshots at any position of the video

## Installation

```sh
npm i gatsby-transformer-video
```

## Prerequisites

You will need to install `ffmpeg` and `ffprobe` as well. Your FFMPEG version should be compiled with at least the following flags enabled:

`--enable-gpl --enable-nonfree --enable-libx264 --enable-libx265 --enable-libvpx --enable-libwebp --enable-libopus`

Some operating systems may provide these FFMPEG via a package manager. Some may **not include** `ffprobe` when installing `ffmpeg`.

If you can't find a way to get ffmpeg with all requirements for your system, you can always compile it on your own: https://trac.ffmpeg.org/wiki/CompilationGuide

**How to link ffmpeg to this plugin:**

- Provide the path to ffmpeg && ffprobe via GatsbyJS plugin configuration
- Set an environment variable -> https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#ffmpeg-and-ffprobe
- Add the static binaries to any folder in your `$PATH`

### Linux

Linux users might be able to: `sudo apt-get install ffmpeg`

Make sure you have `ffprobe` installed as well.

### OSX

If you got [brew](https://brew.sh/) installed, you can get FFMPEG including FFPROBE via:

```sh
brew tap homebrew-ffmpeg/ffmpeg
brew install homebrew-ffmpeg/ffmpeg/ffmpeg --with-fdk-aac --with-webp
```

<sub>(Source: https://trac.ffmpeg.org/wiki/CompilationGuide/macOS#ffmpegthroughHomebrew)</sub>

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

        // Optional profiles for full fluent-ffmpeg access
        profiles: {
          sepia: {
            extension: `mp4`,
            converter: function({ ffmpegSession, videoStreamMetadata }) {
              // Example:
              // https://github.com/gatsbyjs/gatsby/blob/gatsby-transformer-video/examples/using-gatsby-transformer-video/gatsby-config.js
            }
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
        videoGif(duration: 2, fps: 3, maxWidth: 300) {
          path
        }
        videoH264(
          overlay: "gatsby.png"
          overlayX: "end"
          overlayY: "start"
          overlayPadding: 25
          screenshots: "0,50%" (See: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#screenshotsoptions-dirname-generate-thumbnails)
        ) {
          path #String
          absolutePath #String
          name #String
          ext #String
          codec #String
          formatName #String
          formatLongName #String
          startTime #Float
          duration #Float
          size #Int
          bitRate #Int
          screenshots #String
        }
        videoProfile(profile: "yourProfileName") {
          path
        }
      }
    }
  }
  allContentfulAsset {
    edges {
      node {
        # Same fields available as above
      }
    }
  }
}
```

## Caching

Generating videos take time. A lot. You should cache your results. Otherwise, you might not even be able to publish on your hosting platform.

Here is a list of plugins that can help you:

- Netlify: https://www.gatsbyjs.org/packages/gatsby-plugin-netlify-cache/
- Via SFTP: https://www.gatsbyjs.org/packages/gatsby-plugin-sftp-cache/
- Gatsby Cloud should work well to store the generated files
- We could write a caching plugin using a node p2p network like https://dat.foundation/ to eventually eliminate the need of a server for caching generated files
