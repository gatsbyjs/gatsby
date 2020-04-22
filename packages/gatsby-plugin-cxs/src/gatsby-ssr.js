import React from "react"
import cxs from "cxs"

exports.onRenderBody = ({ setHeadComponents }) => {
  const css = cxs.css()
  setHeadComponents([
    <style
      id="cxs-ids"
      key="cxs-ids"
      dangerouslySetInnerHTML={{ __html: css }}
    />,
  ])
}
