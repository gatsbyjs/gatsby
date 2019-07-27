import React from "react"
import { graphql } from "gatsby"

import DocBlock from "./doc-block"
import { SubHeader } from "./utils"

const List = ({ elements, level, ignoreParams }) => (
  <ul
    sx={{
      listStyleType: `none`,
      mt: 3,
      ml: 4,
      mb: 0,
    }}
  >
    {elements
      .filter(param => !ignoreParams.includes(param.name))
      .map(param => (
        <li key={param.name}>
          <DocBlock definition={param} level={level + 1} />
        </li>
      ))}
  </ul>
)

const Params = ({ definition, level = 0, ignoreParams = [] }) => {
  if (definition.params && definition.params.length > 0) {
    return (
      <React.Fragment>
        <SubHeader level={level}>Parameters</SubHeader>
        <List
          elements={definition.params}
          level={level}
          ignoreParams={ignoreParams}
        />
      </React.Fragment>
    )
  }
  if (definition.properties && definition.properties.length > 0) {
    return (
      <React.Fragment>
        {level === 0 && <SubHeader level={level}>Properties</SubHeader>}
        <List
          elements={definition.properties}
          level={level}
          ignoreParams={ignoreParams}
        />
      </React.Fragment>
    )
  }
  if (
    definition.members &&
    definition.members.static &&
    definition.members.static.length > 0
  ) {
    return (
      <React.Fragment>
        {level === 0 && <SubHeader level={level}>Fields</SubHeader>}
        <List
          elements={definition.members.static}
          level={level}
          ignoreParams={ignoreParams}
        />
      </React.Fragment>
    )
  }
  if (definition.type && definition.type.typeDef) {
    return <Params definition={definition.type.typeDef} level={level} />
  }

  return null
}

export default Params

export const fragment = graphql`
  fragment DocumentationParamBase on DocumentationJs {
    params {
      name
      ...DocumentationDescriptionFragment
      ...DocumentationExampleFragment
      ...DocumentationTypeFragment
    }
    properties {
      name
      ...DocumentationExampleFragment
      ...DocumentationTypeFragment
    }
    ...DocumentationTypeFragment
    ...DocumentationDescriptionFragment
    ...DocumentationExampleFragment
    ...DocumentationReturnsFragment
  }
  fragment DocumentationParamsFieldsFragment on DocumentationJs {
    ...DocumentationParamBase
    members {
      static {
        ...DocumentationParamBase
        type {
          typeDef {
            ...DocumentationParamBase
          }
        }
      }
    }
    type {
      typeDef {
        ...DocumentationParamBase
        members {
          static {
            ...DocumentationParamBase
          }
        }
      }
    }
  }
  fragment DocumentationParamsFragmentR1 on DocumentationJs {
    ...DocumentationParamsFieldsFragment
    params {
      ...DocumentationParamsFieldsFragment
    }
    properties {
      ...DocumentationParamsFieldsFragment
    }
    members {
      static {
        ...DocumentationParamsFieldsFragment
      }
    }
    type {
      typeDef {
        ...DocumentationParamsFieldsFragment
      }
    }
  }
  fragment DocumentationParamsFragmentR2 on DocumentationJs {
    ...DocumentationParamsFragmentR1
    params {
      ...DocumentationParamsFragmentR1
    }
    properties {
      ...DocumentationParamsFragmentR1
    }
    members {
      static {
        ...DocumentationParamsFragmentR1
      }
    }
    type {
      typeDef {
        ...DocumentationParamsFragmentR1
      }
    }
  }

  fragment DocumentationParamsFragment on DocumentationJs {
    ...DocumentationParamsFragmentR2
    params {
      ...DocumentationParamsFragmentR2
    }
    properties {
      ...DocumentationParamsFragmentR2
    }
    members {
      static {
        ...DocumentationParamsFragmentR2
      }
    }
    type {
      typeDef {
        ...DocumentationParamsFragmentR2
      }
    }
  }
`
