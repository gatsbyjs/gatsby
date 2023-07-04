// eslint-disable-next-line no-unused-vars
import regeneratorRuntime from "regenerator-runtime"

import * as React from "react"
import { createRoot } from "react-dom/client"
import { GraphiQL } from "graphiql"
import { getIntrospectionQuery } from "graphql"
import { useExplorerPlugin } from "@graphiql/plugin-explorer"
import { useExporterPlugin } from "@graphiql/plugin-code-exporter"

import { snippets } from "./code-exporter/snippets.js"
import { Logo } from "./logo.jsx"
import { fetcher, fetchFragments, locationQuery } from "./utils.js"
import { RefreshDataSourceButton } from "./toolbar.jsx"
import {
  FALLBACK_QUERY,
  GRAPHIQL_URL,
  LOCAL_STORAGE_NAMES,
  REFRESH_URL,
} from "./constants.js"

import "graphiql/graphiql.css"
import "@graphiql/plugin-explorer/dist/style.css"
import "@graphiql/plugin-code-exporter/dist/style.css"
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

async function graphQLIntrospection() {
  const res = await fetch(GRAPHIQL_URL, {
    method: `POST`,
    headers: {
      Accept: `application/json`,
      "Content-Type": `application/json`,
    },
    credentials: `include`,
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  })

  return res.json()
}

const DEFAULT_QUERY =
  parameters.query ||
  (window.localStorage &&
    window.localStorage.getItem(LOCAL_STORAGE_NAMES.query)) ||
  FALLBACK_QUERY

GraphiQL.Logo = Logo

const App = ({ initialExternalFragments }) => {
  const [query, setQuery] = React.useState(DEFAULT_QUERY)
  const [refreshState, setRefreshState] = React.useState({
    enableRefresh: false,
    refreshToken: null,
  })
  const [externalFragments, setExternalFragments] = React.useState(
    initialExternalFragments
  )

  React.useEffect(() => {
    const fetchData = async () => {
      const result = await graphQLIntrospection()

      let { enableRefresh, refreshToken } = result.extensions

      switch (typeof enableRefresh) {
        case `string`: {
          const lowerCased = enableRefresh.toLowerCase()
          enableRefresh = lowerCased === `1` || lowerCased === `true`
          break
        }
        case `number`:
          enableRefresh = enableRefresh > 0
          break
      }

      setRefreshState({
        enableRefresh,
        refreshToken,
      })
    }

    fetchData()
  }, [])

  const explorerPlugin = useExplorerPlugin({
    query,
    onEdit: setQuery,
  })

  const exporterPlugin = useExporterPlugin({
    query,
    snippets,
  })

  const refreshExternalDataSource = () => {
    const options = { method: `POST` }
    if (refreshState.refreshToken) {
      options.headers = {
        Authorization: refreshState.refreshToken,
      }
    }
    fetchFragments().then(updatedExternalFragments => {
      setExternalFragments(updatedExternalFragments)
    })

    return fetch(REFRESH_URL, options)
  }

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
        additionalContent: refreshState.enableRefresh && (
          <RefreshDataSourceButton onClick={refreshExternalDataSource} />
        ),
      }}
      externalFragments={externalFragments}
      plugins={[explorerPlugin, exporterPlugin]}
    />
  )
}

const container = document.getElementById(`root`)
const root = createRoot(container)

// crude way to fetch fragments on boot time
// it won't hot reload fragments (refresh required)
// but good enough for initial integration
fetchFragments().then(initialExternalFragments => {
  root.render(<App initialExternalFragments={initialExternalFragments} />)
})
