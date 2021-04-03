import * as React from "react"
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'

import Protected from "./protected"

const App = () => {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0()

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) loginWithRedirect()
  }, [isLoading, isAuthenticated, loginWithRedirect])

  if (isLoading)
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <p>Loading...</p>
      </div>
    )

  if (isAuthenticated) return <Protected />

  return null
}

const IndexPage = ({props}) => (
  <Auth0Provider
    domain={`${process.env.GATSBY_AUTH0_DOMAIN}`}
    clientId={`${process.env.GATSBY_AUTH0_CLIENT_ID}`}
    redirectUri={`${process.env.GATSBY_AUTH0_REDIRECT_URI}`}
  >
    <App {...props} />
  </Auth0Provider>
)

export default IndexPage
