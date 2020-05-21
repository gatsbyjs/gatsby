import React from "react"
import { Provider, Client } from "urql"
import { ThemeProvider, getTheme } from "gatsby-interface"
import { ThemeProvider as StrictUIProvider } from "strict-ui"
import { createUrqlClient } from "../urql-client"

const baseTheme = getTheme()

const theme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    background: baseTheme.colors.grey[90],
  },
  fontWeights: {
    ...baseTheme.fontWeights,
    "500": 500,
  },
  borders: {
    default: `1px solid ${baseTheme.colors.whiteFade[20]}`,
  },
  sizes: {
    // NOTE(@mxstbr): Hacks around issues with strict-ui that I have to fix upstream eventually
    "1px": `1px`,
    "100%": `100%`,
    "16px": `16px`,
    initial: `initial`,
  },
}

const GraphQLProvider: React.FC<{}> = ({ children }) => {
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

const Providers: React.FC<{}> = ({ children }) => (
  <StrictUIProvider theme={theme}>
    <ThemeProvider theme={theme}>
      <GraphQLProvider>{children}</GraphQLProvider>
    </ThemeProvider>
  </StrictUIProvider>
)

export default Providers
