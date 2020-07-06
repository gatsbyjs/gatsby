import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { RouteAnnouncement } from 'gatsby'

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <RouteAnnouncement><h1>NOT FOUND</h1></RouteAnnouncement>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </Layout>
)

export default NotFoundPage
