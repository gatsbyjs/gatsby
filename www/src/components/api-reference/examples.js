/** @jsx jsx */
import { jsx } from "theme-ui"
import { graphql } from "gatsby"

const Example = ({ example }) => (
  <div className="gatsby-highlight">
    <pre className="language-javascript">
      <code
        className="language-javascript"
        dangerouslySetInnerHTML={{
          __html: example.highlighted,
        }}
      />
    </pre>
  </div>
)

const ExamplesBlock = ({ definition }) => {
  if (definition.examples && definition.examples.length > 0) {
    return (
      <div>
        <h4 sx={{ mt: 6 }}>Example</h4>
        {` `}
        {definition.examples.map((example, i) => (
          <Example example={example} key={`example ${i}`} />
        ))}
      </div>
    )
  }
  if (definition.type && definition.type.typeDef) {
    return <ExamplesBlock definition={definition.type.typeDef} />
  }
  return null
}

export default ExamplesBlock

export const fragment = graphql`
  fragment DocumentationExampleFragment on DocumentationJs {
    examples {
      highlighted
    }
    type {
      typeDef {
        examples {
          highlighted
        }
      }
    }
  }
`
