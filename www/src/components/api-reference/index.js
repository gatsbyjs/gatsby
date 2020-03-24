/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql } from "gatsby"

import DocBlock from "./doc-block"

const APIContents = ({ docs }) => (
  <ul>
    {docs.map(node => (
      <li key={`function list ${node.name}`}>
        <a href={`#${node.name}`}>{node.name}</a>
      </li>
    ))}
  </ul>
)

export { APIContents }

export default ({
  docs,
  relativeFilePath = null,
  showTopLevelSignatures = false,
  ignoreParams = [],
}) => (
  <React.Fragment>
    {docs.map((definition, i) => (
      <div
        id={definition.name}
        key={`reference list ${definition.name}`}
        sx={{ mb: 6 }}
      >
        {i !== 0 && <hr />}
        <DocBlock
          definition={definition}
          relativeFilePath={relativeFilePath}
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
      childMdx {
        body
      }
    }
    deprecated {
      childMdx {
        body
      }
    }
  }

  fragment DocumentationFragment on DocumentationJs {
    kind
    ...DocumentationDescriptionFragment
    ...DocumentationExampleFragment
    ...DocumentationParamsFragment
    ...DocumentationReturnsFragment
  }

  fragment ApiCallFragment on GatsbyAPICallGroupConnection {
    name: fieldValue
    nodes {
      file
      codeLocation {
        start {
          line
        }
        end {
          line
        }
      }
    }
  }
`
