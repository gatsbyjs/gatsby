const React = require(`react`)

const preferDefault = m => (m && m.default) || m
let Layout
try {
  Layout = preferDefault(require(GATSBY_LAYOUT_COMPONENT_PATH))
} catch (e) {
  if (e.toString().indexOf(`Error: Cannot find module`) !== -1) {
    throw new Error(
      `Couldn't find layout component at "${GATSBY_LAYOUT_COMPONENT_PATH}.\n\n` +
        `Please create layout component in that location or specify path to layout component in gatsby-config.js`
    )
  } else {
    throw e
  }
}

// eslint-disable-next-line react/prop-types,react/display-name
module.exports = ({ element, props }) => <Layout {...props}>{element}</Layout>
