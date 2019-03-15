import React from "react"
import { graphql } from "gatsby"

import { space } from "../../utils/presets"

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
        <h4 css={{ marginTop: space[6] }}>Example</h4>
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
