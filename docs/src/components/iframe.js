import * as React from "react"

export default function IFrame({ src, height, title, width, ...rest }) {
  return (
    <div
      className={`gatsby-resp-iframe-wrapper`}
      css={{
        paddingBottom: `${(height / width) * 100}%`,
        position: `relative`,
        height: 0,
        overflow: `hidden`,
        "iframe, object": {
          position: `absolute`,
          top: 0,
          left: 0,
          width: `100%`,
          height: `100%`,
        },
      }}
    >
      <iframe src={src} title={title} {...rest} />
    </div>
  )
}
