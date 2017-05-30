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
        {this.props.data.file.childrenDocumentationJs.map((c, i) => {
          return (
            <div css={{ marginBottom: rhythm(1) }}>
              {i !== 0 && <hr />}
              <h2><code>{c.name}</code></h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: c.description.childMarkdownRemark.html,
                }}
              />
              {c.params.length > 0 &&
                <div>
                  <h3>Params</h3>
                  {c.params.map(Param)}
                </div>}

              {c.examples.length > 0 &&
                <div>
                  <h4>Example</h4>
                  {" "}
                  {c.examples.map(example => (
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
  file(absolutePath: {regex: "/actions.js/"}) {
    childrenDocumentationJs {
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
        highlighted
      }
      params {
        name
        description {
          childMarkdownRemark {
            html
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
`
