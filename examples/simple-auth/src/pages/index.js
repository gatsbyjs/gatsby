import React from "react"
import { Link } from "gatsby"
import Layout from "../components/Layout"
import View from "../components/View"
import Status from "../components/Status"

const Index = () => (
  <Layout>
    <Status />
    <View title="Simple Authentication Example">
      <p>
        This is a simple example of creating dynamic apps with Gatsby that
        require user authentication. It uses concepts from the
        {` `}
        <a href="https://www.gatsbyjs.com/docs/client-only-routes-and-user-authentication/">
          client-only routes section
        </a>
        {` `}
        of the “Building Apps with Gatsby” documentation.
      </p>
      <p>
        For the full experience, go to
        {` `}
        <Link to="/app/profile">your profile</Link>.
      </p>
    </View>
  </Layout>
)

export default Index
