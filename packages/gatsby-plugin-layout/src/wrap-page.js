const React = require(`react`)

const preferDefault = m => (m && m.default) || m
const Layout = preferDefault(require(GATSBY_LAYOUT_COMPONENT_PATH))

// eslint-disable-next-line react/prop-types,react/display-name
module.exports = ({ element, props }) => <Layout {...props}>{element}</Layout>
