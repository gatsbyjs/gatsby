import React from "react"
import { graphql } from "gatsby"

import "./styles.css"

function Video({ video: { video, videoPreview }, ...props }) {
  return (
    <div {...props}>
      <h3>
        Performant animated preview via{` `}
        <a href="https://css-tricks.com/fallbacks-videos-images/">
          picture element
        </a>
        :
      </h3>
      <picture>
        <source type="video/mp4" srcSet={videoPreview.mp4} />
        <source type="image/webp" srcSet={videoPreview.webp} />
        <img src={videoPreview.gif} />
      </picture>
      <h3>Video as optimized h264 &amp; h265:</h3>
      <video playsInline preload="auto" controls>
        <source src={video.h265} type="video/mp4; codecs=hevc" />
        <source src={video.h264} type="video/mp4; codecs=avc1" />
      </video>
    </div>
  )
}

const Index = ({ data }) => {
  const videos = data.allFile.edges.map(({ node }) => node)

  return (
    <div>
      <h1>Using gatsby-transformer-video</h1>
      <div className="grid">
        {videos.map(video => (
          <Video key={video.id} video={video} />
        ))}
      </div>
    </div>
  )
}

export default Index

export const query = graphql`
  query HomePageQuery {
    allFile {
      edges {
        node {
          id
          videoPreview(duration: 2, fps: 3, maxWidth: 600) {
            gif
            mp4
            webp
          }
          video {
            h264
            h265
          }
        }
      }
    }
  }
`
