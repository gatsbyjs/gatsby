import React from "react"
import PropTypes from "prop-types"

const Bar = props => <div>bar: {props.hello}</div>

Bar.propTypes = {
  hello: PropTypes.string,
}

const Foo = props => {
  const newChildren = React.Children.map(
    props.children,
    child =>
      child.type === Bar ? (
        React.cloneElement(child, { hello: `world` })
      ) : (
        <div>not same</div>
      )
  )
  return <div>{newChildren}</div>
}

const IndexComponent = () => (
  <Foo>
    <Bar />
  </Foo>
)

export default IndexComponent
