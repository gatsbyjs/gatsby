import React from "react"
// import DogVideo from "../assets/dog.mp4"

export default () => (
  <video controls style={{ width: `100%` }}>
    {/* 
      This could also be done with a local file imported in the 
      comment above and a source element like this being used:
      <source src={DogVideo} type="video/mp4" /> 
    */}
    <source
      src={`https://gcs-vimeo.akamaized.net/exp=1564107908~acl=%2A%2F1033410098.mp4%2A~hmac=6b0f9269937b2466f529f45d8f4d33314d03890878d68cec1995a1b0b0d63e82/vimeo-prod-skyfire-std-us/01/309/11/276547742/1033410098.mp4`}
      type="video/mp4"
    />
  </video>
)
