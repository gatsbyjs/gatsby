import React from 'react'
import { renderToString } from 'react-dom/server'
import { StyleSheetServer } from 'aphrodite'

exports.replaceRenderer = ({
  bodyComponent,
  setHeadComponents,
  replaceBodyHTMLString,
}) => {
  const { html, css } = StyleSheetServer.renderStatic(() => renderToString(bodyComponent))

  const styles = <style data-aphrodite>{`${css.content}`}</style>
  const classNames = (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__APHRODITE_CLASS_NAMES__ = ${JSON.stringify(css.renderedClassNames)}`,
      }}
    />
  )

  setHeadComponents([styles, classNames])
  replaceBodyHTMLString(html)
}