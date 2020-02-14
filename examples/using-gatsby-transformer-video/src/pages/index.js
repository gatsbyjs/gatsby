import React from "react"
import { graphql } from "gatsby"

import "./styles.css"

function Video({
  video: {
    name,
    videoH264,
    videoH265,
    previewH264,
    previewWebP,
    previewGif,
    videoSepia,
  },
  ...props
}) {
  return (
    <div {...props}>
      <h2>{name}</h2>
      <h3>
        Performant animated preview via{` `}
        <a href="https://css-tricks.com/fallbacks-videos-images/">
          picture element
        </a>
        :
      </h3>
      <picture>
        <source type="video/mp4" srcSet={previewH264.path} />
        <source type="image/webp" srcSet={previewWebP.path} />
        <img loading="lazy" src={previewGif.path} alt="" />
      </picture>
      <h3>Video as optimized h264 &amp; h265:</h3>
      <video playsInline preload="auto" controls>
        <source src={videoH265.path} type="video/mp4; codecs=hevc" />
        <source src={videoH264.path} type="video/mp4; codecs=avc1" />
      </video>
      <h3>Custom video converter:</h3>
      <video playsInline preload="auto" controls>
        <source src={videoSepia.path} type="video/mp4; codecs=avc1" />
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
          name
          videoH264(
            overlay: "gatsby.png"
            overlayX: "end"
            overlayY: "start"
            overlayPadding: 25
          ) {
            path
          }
          videoH265(
            overlay: "gatsby.png"
            overlayX: "end"
            overlayY: "start"
            overlayPadding: 25
          ) {
            path
          }
          videoSepia: videoProfile(profile: "sepia", maxWidth: 800) {
            path
          }
          previewH264: videoH264(maxWidth: 600, fps: 4, duration: 2) {
            path
          }
          previewWebP: videoWebP(maxWidth: 600, fps: 4, duration: 2) {
            path
          }
          previewGif: videoGif(maxWidth: 300, fps: 4, duration: 2) {
            path
          }
        }
      }
    }
  }
`
