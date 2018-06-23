const React = require(`react`)
const { Link } = require(`gatsby`)

function SomeComponent(props) {
  return <div />
}

export default SomeComponent

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`
