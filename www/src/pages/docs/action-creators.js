import React from "react"
import { rhythm, scale } from "../../utils/typography"

const Param = (param, depth = 0) => {
  // the plugin parameter is used internally but not
  // something a user should use.
  if (param.name == `plugin`) {
    return null
  }

  console.log(param)
  return (
    <div
      css={{
        marginLeft: `${depth * 0.7}rem`,
        ...(depth > 0 && scale(-1 / 5)),
      }}
    >
      <h4
        css={{
          margin: 0,
          ...(depth > 0 && scale((depth === 1 ? 0.5 : 0) / 5)),
        }}
      >
        {param.name === `$0` ? `destructured object` : param.name}
        {" "}
        {param.type &&
          param.name !== `$0` &&
          <span css={{ color: `#73725f` }}>{`{${param.type.name}}`}</span>}
      </h4>
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

class ActionCreatorsDocs extends React.Component {
  render() {
    console.log(this.props)
    return (
      <div>
        <h1>Action Creators</h1>
        <p>Action creators are used by plugins to perform various tasks</p>
        <ul>
          {this.props.data.allDocumentationJs.edges.map(({ node }, i) => {
            return <li>{node.name}</li>
          })}
        </ul>
        {this.props.data.allDocumentationJs.edges.map(({ node }, i) => {
          return (
            <div css={{ marginBottom: rhythm(1) }}>
              {i !== 0 && <hr />}
              <h2><code>{node.name}</code></h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: node.description.childMarkdownRemark.html,
                }}
              />
              {node.params.length > 0 &&
                <div>
                  <h3>Parameters</h3>
                  {node.params.map(Param)}
                </div>}

              {node.examples.length > 0 &&
                <div>
                  <h4 css={{ marginTop: rhythm(1) }}>Example</h4>
                  {" "}
                  {node.examples.map(example => (
                    <pre>
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
          )
        })}
      </div>
    )
  }
}

export default ActionCreatorsDocs

export const pageQuery = graphql`
query ActionCreatorDocsQuery {
  allDocumentationJs(id: {regex: "/src.*actions.js/"}, sortBy: {fields: [name]}) {
    edges {
      node {
        id
        memberof
        name
        id
        scope
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
    }
  }
}
`
