import "regenerator-runtime/runtime.js"

import * as React from "react"
import ReactDOM from "react-dom"
import { GraphiQL } from "graphiql"
import { createGraphiQLFetcher } from "@graphiql/toolkit"
import "graphiql/graphiql.css"
import "./app.css"

const fetchFragments = async () =>
  fetch(`/___graphql/fragments`)
    .catch(err => console.error(`Error fetching external fragments: \n${err}`))
    .then(response => response.json())

const Logo = () => <span>My Corp</span>
GraphiQL.Logo = Logo

const fetcher = createGraphiQLFetcher({ url: `/___graphql` })

const App = () => <GraphiQL fetcher={fetcher} />

// crude way to fetch fragments on boot time
// it won't hot reload fragments (refresh required)
// but good enough for initial integration
fetchFragments().then(externalFragments => {
  ReactDOM.render(<App />, document.getElementById(`root`))
})
