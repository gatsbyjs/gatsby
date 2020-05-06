import React from "react"
import Container from "../components/container"
import Link from "../components/localized-link"
import FooterLinks from "../components/shared/footer-links"
import { SkipNavContent } from "@reach/skip-nav"

export default function FourOhFour() {
  return (
    <>
    <main id={`reach-skip-nav`}>
      <SkipNavContent/>
      <Container>
        <h1>Page not found</h1>
        <p>Oops! The page you are looking for has been removed or relocated.</p>
        <Link to="/">
          <p>Go Back</p>
        </Link>
      </Container>
      <FooterLinks />
      </main>
    </>
  )
}
