import React from "react"
import { navigate } from "gatsby"
import { Auth0Provider } from "@auth0/auth0-react"

import "./src/styles/site.css"

const onRedirectCallback = appState => navigate(appState?.returnTo || "/")

export const wrapRootElement = ({ element }) => {
  return (
    <Auth0Provider
      domain={process.env.GATSBY_AUTH0_DOMAIN}
      clientId={process.env.GATSBY_AUTH0_CLIENT_ID}
      audience={process.env.GATSBY_AUTH0_AUDIENCE}
      scope={process.env.GATSBY_AUTH0_SCOPE}
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      {element}
    </Auth0Provider>
  )
}
