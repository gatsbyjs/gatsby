import React from 'react'
import { Router } from '@reach/router'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import InstrumentPage from '../utils/instrument-page'

const Page = props => (
  <pre data-testid="dom-marker">[client-only-path] {props.page}</pre>
)

const routes = [`/`, `/profile`, `/dashboard`]

const basePath = `/client-only-paths`

const ClientOnlyPathPage = props => (
  <Layout>
    <Router location={props.location} basepath={basePath}>
      <Page path="/" page="index" />
      <Page path="/:page" />
    </Router>
    <ul>
      {routes.map(route => (
        <li key={route}>
          <Link to={`${basePath}${route}`} data-testid={route}>
            {route}
          </Link>
        </li>
      ))}
    </ul>
  </Layout>
)

export default InstrumentPage(ClientOnlyPathPage)
