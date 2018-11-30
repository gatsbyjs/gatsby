const React = require(`react`)
const { renderToString } = require(`react-dom/server`)
const { extractCritical } = require(`emotion-server`)

const { wrapElement } = require(`./wrap-element`)

exports.replaceRenderer = ({
  bodyComponent,
  replaceBodyHTMLString,
  setHeadComponents,
}) => {
  const { html, ids, css } = extractCritical(
    renderToString(wrapElement(bodyComponent))
  )

  setHeadComponents([
    // eslint-disable-next-line react/jsx-key
    <style
      data-emotion-css={ids.join(` `)}
      dangerouslySetInnerHTML={{ __html: css }}
    />,
  ])

  replaceBodyHTMLString(html)
}
