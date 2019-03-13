import React from "react"
import { graphql } from "gatsby"

import DocBlock from "./doc-block"

import { rhythm } from "../../utils/typography"

export default ({
  docs,
  showTopLevelSignatures = false,
  ignoreParams = [],
}) => (
  <React.Fragment>
    {docs.map((definition, i) => (
      <div
        id={definition.name}
        key={`reference list ${definition.name}`}
        css={{ marginBottom: rhythm(1) }}
      >
        {i !== 0 && <hr />}
        <DocBlock
          definition={definition}
          showSignature={showTopLevelSignatures}
          level={0}
          linkableTitle={true}
          ignoreParams={ignoreParams}
        />
      </div>
    ))}
  </React.Fragment>
)

export const pageQuery = graphql`
  fragment DocumentationDescriptionFragment on DocumentationJs {
    name
    description {
      childMarkdownRemark {
        html
      }
    }
    deprecated {
      childMarkdownRemark {
        html
      }
    }
  }

  fragment DocumentationFragment on DocumentationJs {
    ...DocumentationDescriptionFragment
    ...DocumentationExampleFragment
    ...DocumentationParamsFragment
    ...DocumentationReturnsFragment
  }
`
