import React from "react"
import DogVideo from "../assets/dog.mp4"
import Transcript from "file-loader!../assets/transcript.vtt"
import Captions from "file-loader!../assets/captions.vtt"
import Description from "file-loader!../assets/description.vtt"

export default () => (
  <video controls style={{ width: `100%` }}>
    <source src={DogVideo} type="video/mp4" />
    <track kind="transcript" srcLang="en" src={Transcript} />
    <track kind="captions" srcLang="en" src={Captions} />
    <track kind="description" srcLang="en" src={Description} />
  </video>
)
