import * as React from "react"
import { Router } from "@reach/router"
import { Link } from "gatsby"

import Layout from "../components/layout"
import InstrumentPage from "../utils/instrument-page"
import Seo from "../components/seo"

const routes = [`/`, `/not-found`, `/page/profile`, `/nested`, `/nested/foo`]

const basePath = `/client-only-paths`

const Page = ({ page }) => (
  <pre data-testid="dom-marker">[client-only-path] {page}</pre>
)

const NestedRouterRoute = props => (
  <Page page={`nested-page/${props.nestedPage}`} />
)

const PageWithNestedRouter = () => (
  <Router>
    <NestedRouterRoute path="/:nestedPage" />
    <NestedRouterRoute default nestedPage="index" />
  </Router>
)

const NotFound = () => <Page page="NotFound" />

const ClientOnlyPathPage = () => (
  <Layout>
    <Router id="client-only-paths-sub-router">
      <Page path={basePath} page="index" />
      <Page path={`${basePath}/page/:page`} />
      <PageWithNestedRouter path={`${basePath}/nested/*`} />
      <NotFound default />
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

export const Head = () => <Seo />

export default InstrumentPage(ClientOnlyPathPage)
