import React from "react"
import ReactDOM from "react-dom"

import GraphiQL from "graphiql"
import GraphiQLExplorer from "graphiql-explorer"
import { getIntrospectionQuery, buildClientSchema } from "graphql"

import "whatwg-fetch"

import "graphiql/graphiql.css"
import "./app.css"

const parameters = {}
window.location.search
  .substr(1)
  .split(`&`)
  .forEach(function(entry) {
    var eq = entry.indexOf(`=`)
    if (eq >= 0) {
      parameters[decodeURIComponent(entry.slice(0, eq))] = decodeURIComponent(
        entry.slice(eq + 1)
      )
    }
  })
// Produce a Location query string from a parameter object.
function locationQuery(params) {
  return (
    `?` +
    Object.keys(params)
      .filter(function(key) {
        return Boolean(params[key])
      })
      .map(function(key) {
        return encodeURIComponent(key) + `=` + encodeURIComponent(params[key])
      })
      .join(`&`)
  )
}

// Derive a fetch URL from the current URL, sans the GraphQL parameters.
const graphqlParamNames = {
  query: true,
  variables: true,
  operationName: true,
}
const otherParams = {}
for (var k in parameters) {
  if (parameters.hasOwnProperty(k) && graphqlParamNames[k] !== true) {
    otherParams[k] = parameters[k]
  }
}
const fetchURL = locationQuery(otherParams)

function graphQLFetcher(graphQLParams) {
  return fetch(fetchURL, {
    method: `post`,
    headers: {
      Accept: `application/json`,
      "Content-Type": `application/json`,
    },
    body: JSON.stringify(graphQLParams),
    credentials: `include`,
  }).then(function(response) {
    return response.json()
  })
}

// When the query and variables string is edited, update the URL bar so
// that it can be easily shared.
function onEditVariables(newVariables) {
  parameters.variables = newVariables
  updateURL()
}
function onEditOperationName(newOperationName) {
  parameters.operationName = newOperationName
  updateURL()
}
function updateURL() {
  history.replaceState(null, null, locationQuery(parameters))
}

// We control query, so we need to recreate initial query text that show up
// on visiting graphiql - in order it will be
//  - query from query string (if set)
//  - query stored in localStorage (which graphiql set when closing window)
//  - default empty query
const DEFAULT_QUERY =
  parameters.query ||
  (window.localStorage && window.localStorage.getItem(`graphiql:query`)) ||
  `{

}`

class App extends React.Component {
  state = { schema: null, query: DEFAULT_QUERY, explorerIsOpen: true }

  componentDidMount() {
    graphQLFetcher({
      query: getIntrospectionQuery(),
    }).then(result => {
      this.setState({ schema: buildClientSchema(result.data) })
    })
  }

  _handleEditQuery = query => {
    parameters.query = query
    updateURL()
    this.setState({ query })
  }

  _handleToggleExplorer = () => {
    this.setState({ explorerIsOpen: !this.state.explorerIsOpen })
  }

  render() {
    const { query, schema } = this.state

    return (
      <React.Fragment>
        <GraphiQLExplorer
          schema={schema}
          query={query}
          onEdit={this._handleEditQuery}
          explorerIsOpen={this.state.explorerIsOpen}
          onToggleExplorer={this._handleToggleExplorer}
        />
        <GraphiQL
          ref={ref => (this._graphiql = ref)}
          fetcher={graphQLFetcher}
          schema={schema}
          query={query}
          onEditQuery={this._handleEditQuery}
          onEditVariables={onEditVariables}
          onEditOperationName={onEditOperationName}
        >
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              onClick={() => this._graphiql.handlePrettifyQuery()}
              label="Prettify"
              title="Prettify Query (Shift-Ctrl-P)"
            />
            <GraphiQL.Button
              onClick={() => this._graphiql.handleToggleHistory()}
              label="History"
              title="Show History"
            />
            <GraphiQL.Button
              onClick={this._handleToggleExplorer}
              label="Explorer"
              title="Toggle Explorer"
            />
          </GraphiQL.Toolbar>
        </GraphiQL>
      </React.Fragment>
    )
  }
}

ReactDOM.render(<App />, document.getElementById(`root`))
