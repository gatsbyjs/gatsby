import React from "react"
import { Provider, Client } from "urql"
import { createUrqlClient } from "../urql-client"

export default ({ children }): React.ReactElement => {
  const [status, setStatus] = React.useState(`loading`)
  const [client, setClient] = React.useState<Client | null>(null)

  React.useEffect(() => {
    setStatus(`loading`)
    fetch(`/___services`)
      .then(res => res.json())
      .then(json => {
        setStatus(`idle`)
        if (json.recipesgraphqlserver) {
          setClient(createUrqlClient({ port: json.recipesgraphqlserver.port }))
        }
      })
  }, [])

  if (status === `loading`) return <p>Loading...</p>

  if (client === null)
    return <p>It looks like no develop process is running.</p>

  return <Provider value={client}>{children}</Provider>
}
