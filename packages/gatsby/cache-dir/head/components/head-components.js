import React from "react"

import { HTML_BODY_ORIGINAL_TAG_ATTRIBUTE_KEY } from "../constants"

// TODO(serhalp): Expose these as a new public API to allows us to gradually phase out
// the existing `<html>` and `<body>` features in the Head API, allowing us to remove
// the various workounds we have in place for React 19.
export function Html(props) {
  const allProps = {
    ...props,
    [HTML_BODY_ORIGINAL_TAG_ATTRIBUTE_KEY]: `html`,
  }
  return <div {...allProps} />
}
export function Body(props) {
  const allProps = {
    ...props,
    [HTML_BODY_ORIGINAL_TAG_ATTRIBUTE_KEY]: `body`,
  }
  return <div {...allProps} />
}
