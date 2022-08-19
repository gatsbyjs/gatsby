const React = require("react")
const Layout = require("./src/components/layout").default

exports.wrapPageElement = ({ element, props }) => (
  <Layout {...props}>{element}</Layout>
)
