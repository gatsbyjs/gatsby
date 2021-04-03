import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'gatsby'
import { StaticImage } from 'gatsby-plugin-image'
import React from 'react'

import Layout from '../components/layout'
import SEO from "../components/seo"

const Protected = () => {

  const { logout } = useAuth0()

  return (
    <Layout>
      <SEO title="Protected" />
      <p>
        This is Protected page using auth0. You have to login using auth0 to access this page.
      </p>
      <p>You can logout using <button onClick={() => logout({ returnTo: window.location.origin })}>this button</button></p>
      <StaticImage
        src="../images/gatsby-astronaut.png"
        width={300}
        quality={95}
        formats={["AUTO", "WEBP", "AVIF"]}
        alt="A Gatsby astronaut"
        style={{ marginBottom: `1.45rem` }}
    />
    </Layout>
  )
}

export default Protected
