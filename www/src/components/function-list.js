import React from "react"

import { rhythm, scale } from "../utils/typography"

const Param = (param, depth = 0) => {
  // the plugin parameter is used internally but not
  // something a user should use.
  if (param.name === `plugin` || param.name === `traceId`) {
    return null
  }

  return (
    <div
      key={`param ${JSON.stringify(param)}`}
      css={{
        marginLeft: `${depth * 1.05}rem`,
        ...(depth > 0 && scale((depth === 1 ? -1 : -1.5) / 5)),
      }}
    >
      <h5
        css={{
          margin: 0,
          ...(depth > 0 && scale((depth === 1 ? 0 : -0.5) / 5)),
        }}
      >
        {param.name === `$0` ? `destructured object` : param.name}
        {` `}
        {param.type &&
          param.name !== `$0` &&
          <span css={{ color: `#73725f` }}>{`{${param.type.name}}`}</span>}
      </h5>
      {param.description &&
        <div
          css={{ marginBottom: rhythm(-1 / 4) }}
          dangerouslySetInnerHTML={{
            __html: param.description.childMarkdownRemark.html,
          }}
        />}
      {param.properties &&
        <div css={{ marginTop: rhythm(1 / 2) }}>
          {param.properties.map(param => Param(param, depth + 1))}
        </div>}
    </div>
  )
}

export default ({ functions }) => (
  <div>
    {functions.map(({ node }, i) => (
      <div
        id={node.name}
        key={`reference list ${node.name}`}
        css={{ marginBottom: rhythm(1) }}
      >
        {i !== 0 && <hr />}
        <h3><a href={`#${node.name}`}><code>{node.name}</code></a></h3>
        <div
          dangerouslySetInnerHTML={{
            __html: node.description.childMarkdownRemark.html,
          }}
        />
        {node.params.length > 0 &&
          <div>
            <h4>Parameters</h4>
            {node.params.map(Param)}
          </div>}

        {node.examples.length > 0 &&
          <div>
            <h4 css={{ marginTop: rhythm(1) }}>Example</h4>
            {` `}
            {node.examples.map((example, i) => (
              <pre key={`${node.name} example ${i}`}>
                <code
                  className="language-javascript"
                  dangerouslySetInnerHTML={{
                    __html: example.highlighted,
                  }}
                />
              </pre>
            ))}
          </div>}
      </div>
    ))}
  </div>
)

export const pageQuery = graphql`
fragment FunctionList on DocumentationJs {
  name
  description {
    childMarkdownRemark {
      html
    }
  }
  returns {
    title
  }
  examples {
    raw
    highlighted
  }
  params {
    name
    type {
      name
    }
    description {
      childMarkdownRemark {
        html
      }
    }
    properties {
      name
      type {
        name
      }
      description {
        childMarkdownRemark {
          html
        }
      }
      properties {
        name
        type {
          name
        }
        description {
          childMarkdownRemark {
            html
          }
        }
      }
    }
  }
}
`
