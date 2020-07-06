import React from "react"
import { Link, RouteAnnouncement } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const EmergencyKit = () => (
  <Layout>
    <SEO title="Emergency Kit" />
    <RouteAnnouncement><h1>Emergency Kit</h1></RouteAnnouncement>
    <p>If you click the skip link, the next tab will take you to the "Go back to homepage" link.</p>
    <p>
      Make sure you're prepared for the worst. Put together a kit for the most stressful
      situations. You'll want something for each of your senses:
    </p>
    <ol>
      <li>
        Something to look at (cute pictures, vacation spots, family photos)
      </li>
      <li>Something to listen to (music, soothing sounds, call a friend)</li>
      <li>Something to smell (fresh flowers, an orange, coffee, lotion)</li>
      <li>
        Something to feel (a soft scarf, sticky tape, stress ball, craft
        project)
      </li>
      <li>Something to taste (candy, lip balm, gum, favorite tea)</li>
    </ol>
    <Link to="/">Go back to the homepage</Link>
  </Layout>
)

export default EmergencyKit
