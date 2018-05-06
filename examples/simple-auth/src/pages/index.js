import React from "react"
import Link from "gatsby-link"
import View from "../components/View"
import Status from "../components/Status"

const Index = () => (
  <div>
    <Status />
    <View title="Simple Authentication Example">
      <p>
        This is a simple example of creating dynamic apps with Gatsby that
        require user authentication. It uses concepts from the{` `}
        <a href="https://www.gatsbyjs.org/docs/building-apps-with-gatsby/#client-only-routes">
          client-only routes section
        </a>
        {` `}
        of the “Building Apps with Gatsby” documentation.
      </p>
      <p>
        For the full experience, go to{` `}
        <Link to="/app/profile">your profile</Link>.
      </p>
    </View>
  </div>
)

export default Index
