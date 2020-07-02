const React = require(`react`)
const Github = require(`./src/components/github`).default

exports.wrapPageElement = ({ element }) => (
  <>
    <Github />
    {element}
  </>
)
