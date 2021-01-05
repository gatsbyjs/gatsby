const React = require("react")

const { LaterHydrator } = require(".")

exports.wrapRootElement = ({ element }) => {
  return (
    <LaterHydrator>
      {element}
    </LaterHydrator>
  )
}