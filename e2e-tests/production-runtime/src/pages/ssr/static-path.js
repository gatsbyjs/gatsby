import React from "react"
import { Slice } from "gatsby"

const UseEnv = ({ heading, envVar }) => (
  <React.Fragment>
    <h3>{heading}</h3>
    <pre>
      <code data-testid={heading}>{JSON.stringify(envVar)}</code>
    </pre>
  </React.Fragment>
)

export default function StaticPath({ serverData }) {
  return (
    <div>
      <h2>Query</h2>
      <pre data-testid="query">{JSON.stringify(serverData?.arg?.query)}</pre>
      <h2>Params</h2>
      <pre data-testid="params">{JSON.stringify(serverData?.arg?.params)}</pre>
      <h2>Using env vars (react template)</h2>
      <UseEnv heading="process.env" envVar={process.env} />
      <UseEnv
        heading="process.env.EXISTING_VAR"
        envVar={process.env.EXISTING_VAR}
      />
      <UseEnv
        heading="process.env.NOT_EXISTING_VAR"
        envVar={process.env.NOT_EXISTING_VAR}
      />
      <UseEnv
        heading="process.env.FROM_COMMAND_LINE"
        envVar={process.env.FROM_COMMAND_LINE}
      />
      <UseEnv
        heading="process.env.GATSBY_PREFIXED_FROM_COMMAND_LINE"
        envVar={process.env.GATSBY_PREFIXED_FROM_COMMAND_LINE}
      />
      <h2>Using env vars (getServerData)</h2>
      <UseEnv
        heading="serverData.envVars.VERY_SECRET_ALIAS_VAR"
        envVar={serverData?.envVars?.VERY_SECRET_ALIAS_VAR}
      />
      <UseEnv
        heading="serverData.envVars.EXISTING_VAR"
        envVar={serverData?.envVars?.EXISTING_VAR}
      />
      <UseEnv
        heading="serverData.envVars.NOT_EXISTING_VAR"
        envVar={serverData?.envVars?.NOT_EXISTING_VAR}
      />
      <UseEnv
        heading="serverData.envVars.FROM_COMMAND_LINE"
        envVar={serverData?.envVars?.FROM_COMMAND_LINE}
      />
      <UseEnv
        heading="serverData.envVars.GATSBY_PREFIXED_FROM_COMMAND_LINE"
        envVar={serverData?.envVars?.GATSBY_PREFIXED_FROM_COMMAND_LINE}
      />
      <Slice alias="footer" framework="Gatsby" lang="js" />
    </div>
  )
}

export async function getServerData(arg) {
  const VERY_SECRET_ALIAS_VAR = process.env.VERY_SECRET_VAR
  const EXISTING_VAR = process.env.EXISTING_VAR
  const FROM_COMMAND_LINE = process.env.FROM_COMMAND_LINE
  const GATSBY_PREFIXED_FROM_COMMAND_LINE =
    process.env.GATSBY_PREFIXED_FROM_COMMAND_LINE

  return {
    props: {
      arg,
      envVars: {
        VERY_SECRET_ALIAS_VAR,
        EXISTING_VAR,
        FROM_COMMAND_LINE,
        GATSBY_PREFIXED_FROM_COMMAND_LINE,
      },
    },
  }
}
