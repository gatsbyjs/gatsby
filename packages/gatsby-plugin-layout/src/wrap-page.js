const React = require(`react`)

const preferDefault = m => (m && m.default) || m
const Layout = preferDefault(require(GATSBY_LAYOUT_COMPONENT_PATH).default)

// eslint-disable-next-line react/prop-types,react/display-name
module.exports = ({ component, props }) => (
  <Layout {...props}>{component}</Layout>
)
