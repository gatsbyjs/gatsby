const React = require(`react`)
const Gatsby = require(`gatsby`)

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
