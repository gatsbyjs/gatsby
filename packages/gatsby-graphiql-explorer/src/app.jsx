import "regenerator-runtime/runtime.js"

import * as React from "react"
import ReactDOM from "react-dom"
import { GraphiQL } from "graphiql"
import { useExplorerPlugin } from "@graphiql/plugin-explorer"

import { Logo } from "./logo.jsx"
import { fetcher, fetchFragments, locationQuery } from "./utils.js"
import { RefreshDataSourceButton } from "./toolbar.jsx"
import { FALLBACK_QUERY, LOCAL_STORAGE_NAMES } from "./constants.js"

import "graphiql/graphiql.css"
import "@graphiql/plugin-explorer/dist/style.css"
import "./app.css"

const parameters = {}

window.location.search
  .slice(1)
  .split(`&`)
  .forEach(function (entry) {
    const eq = entry.indexOf(`=`)
    if (eq >= 0) {
      parameters[decodeURIComponent(entry.slice(0, eq))] = decodeURIComponent(
        entry.slice(eq + 1)
      )
    }
  })

// When the query and variables string is edited, update the URL bar so
// that it can be easily shared.
function onEditQuery(newQuery) {
  parameters.query = newQuery
  updateURL()
}

function onEditVariables(newVariables) {
  parameters.variables = newVariables
  updateURL()
}

function onEditHeaders(newHeaders) {
  parameters.headers = newHeaders
  updateURL()
}

function onEditOperationName(newOperationName) {
  parameters.operationName = newOperationName
  updateURL()
}

function onTabChange(tabsState) {
  const activeTab = tabsState.tabs[tabsState.activeTabIndex]
  parameters.query = activeTab.query
  parameters.variables = activeTab.variables
  parameters.headers = activeTab.headers
  updateURL()
}

function updateURL() {
  history.replaceState(null, null, locationQuery(parameters))
}

const DEFAULT_QUERY =
  parameters.query ||
  (window.localStorage &&
    window.localStorage.getItem(LOCAL_STORAGE_NAMES.query)) ||
  FALLBACK_QUERY

GraphiQL.Logo = Logo

const App = ({ externalFragments }) => {
  const [query, setQuery] = React.useState(DEFAULT_QUERY)
  const explorerPlugin = useExplorerPlugin({
    query,
    onEdit: setQuery,
  })

  return (
    <GraphiQL
      fetcher={fetcher}
      query={query}
      variables={parameters.variables}
      headers={parameters.headers}
      onEditQuery={query => {
        setQuery(query)
        onEditQuery(query)
      }}
      onEditVariables={onEditVariables}
      onEditOperationName={onEditOperationName}
      onEditHeaders={onEditHeaders}
      onTabChange={onTabChange}
      toolbar={{
        additionalContent: (
          <RefreshDataSourceButton onClick={() => console.log(`hello world`)} />
        ),
      }}
      externalFragments={externalFragments}
      plugins={[explorerPlugin]}
    />
  )
}

// crude way to fetch fragments on boot time
// it won't hot reload fragments (refresh required)
// but good enough for initial integration
fetchFragments().then(externalFragments => {
  ReactDOM.render(
    <App externalFragments={externalFragments} />,
    document.getElementById(`root`)
  )
})
