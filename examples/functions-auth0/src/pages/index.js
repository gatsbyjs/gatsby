import React, { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"

import Layout from "../components/layout"

export default function Home() {
  const [response, setResponse] = useState()
  const { getAccessTokenSilently, isLoading, error, user } = useAuth0()

  const callApi = async path => {
    try {
      setResponse("Loading...")

      const token = await getAccessTokenSilently({
        audience: process.env.GATSBY_AUTH0_AUDIENCE,
      })

      const api = await fetch("/api/" + path, {
        headers: {
          authorization: "Bearer " + token,
        },
      })

      const body = await api.json()
      setResponse({
        status: api.status,
        statusText: api.statusText,
        body,
      })
    } catch (e) {
      setResponse(e.message)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto">
        <h2 className="text-xl mb-3">Authenticating with Auth0</h2>
        {!isLoading && !user ? (
          <p className="mb-3">
            Before your user can call an API, they need to authenticate. Go
            ahead and click the <strong>Login</strong>
            {` `}
            button on the top right.
          </p>
        ) : (
          <p className="mb-3">
            You are now signed in. To sign out, click the{" "}
            <strong>Logout</strong> button on the top right.
          </p>
        )}
        <pre className="mb-3 text-gray-800 text-sm border-solid border border-gray-400 bg-gray-200 p-3">
          <code>{JSON.stringify({ isLoading, error, user }, null, 2)}</code>
        </pre>
        <h2 className="text-xl mb-3">Calling a Gatsby Hosted Function</h2>
        <p className="mb-3">
          Once the user is authenticated, you can call the API. If you try this
          without authenticating, you&#39;ll get an error.
        </p>
        <button
          className="mr-3 mb-1 text-white bg-gray-600 border-0 py-1 px-3 focus:outline-none hover:bg-gray-800 rounded text-base md:mt-0"
          type="button"
          onClick={() => callApi("/me")}
        >
          My Profile
        </button>
        <p className="mb-3 text-xs text-gray-600">
          Requires a valid access_token.
        </p>
        <button
          className="mb-1 text-white bg-gray-600 border-0 py-1 px-3 focus:outline-none hover:bg-gray-800 rounded text-base md:mt-0"
          type="button"
          onClick={() => callApi("/shows")}
        >
          TV Shows
        </button>
        <p className="mb-3 text-xs text-gray-600">
          Requires a valid access_token with the read:shows scope.
        </p>
        {response && (
          <pre className="mb-3 text-gray-800 text-sm border-solid border border-gray-400 bg-gray-200 p-3">
            <code>{JSON.stringify(response, null, 2)}</code>
          </pre>
        )}
      </div>
    </Layout>
  )
}
