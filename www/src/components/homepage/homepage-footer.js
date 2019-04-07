import React from "react"
import { Link } from "gatsby"

import HomepageSection from "./homepage-section"

const HomepageFooter = () => (
  <HomepageSection>
    <p css={{ textAlign: `center` }}>
      <Link to="/accessibility-statement">Accessibility Statement</Link>
    </p>
  </HomepageSection>
)

export default HomepageFooter
