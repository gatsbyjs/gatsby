import React from "react"
import { graphql } from "gatsby"

import DocBlock from "./doc-block"
import { SubHeader } from "./utils"

const ReturnBlock = ({ definition, level }) => {
  if (definition.returns && definition.returns.length > 0) {
    return (
      <div>
        <SubHeader level={level}>Return value</SubHeader>
        <DocBlock
          definition={definition.returns[0]}
          level={level + 1}
          title=""
        />
      </div>
    )
  }
  if (definition.type && definition.type.typeDef) {
    return <ReturnBlock definition={definition.type.typeDef} level={level} />
  }
  return null
}

export default ReturnBlock

export const fragment = graphql`
  fragment DocumentationReturnsFragment on DocumentationJs {
    returns {
      ...DocumentationDescriptionFragment
      ...DocumentationTypeFragment
    }
  }
`
