import * as React from "react"
import Layout from "../components/layout"
import { className } from "../styles/404.css"
import "../styles/global.css"

// markup
const NotFoundPage = () => {
  return (
    <Layout>
      <main className={className}>404</main>
    </Layout>
  )
}

export default NotFoundPage
