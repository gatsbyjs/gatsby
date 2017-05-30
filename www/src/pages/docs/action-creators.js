import React from "react"
import { rhythm } from "../../utils/typography"

const Param = param => {
  // the plugin parameter is used internally but not
  // something a user should use.
  if (param.name == `plugin`) {
    return null
  }

  if (!param.properties) {
    return (
      <div>
        <h5 css={{ margin: 0 }}>{param.name}</h5>
        {param.description &&
          <span
            dangerouslySetInnerHTML={{
              __html: param.description.childMarkdownRemark.html,
            }}
          />}
      </div>
    )
    // This is a destructured object.
  } else {
    return (
      <div>
        <h4 css={{ margin: 0, marginBottom: rhythm(1 / 4) }}>
          destructured object
        </h4>
        {param.properties.map(Param)}
      </div>
    )
  }
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
                  <h3>Params</h3>
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
          description {
            internal {
              content
            }
          }
          type {
            type
            name
          }
          properties {
            title
            name
            description {
              childMarkdownRemark {
                html
              }
            }
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
`
