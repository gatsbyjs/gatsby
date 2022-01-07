import React from "react"

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
      <h2>Using env vars</h2>
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
        heading="serverData.envVars"
        envVar={serverData?.envVars}
      />
      <h2>Debug</h2>
      <pre>{JSON.stringify({ serverData }, null, 2)}</pre>
    </div>
  )
}

export async function getServerData(arg) {
  const INSIDE_PRIVATE_ENV_VAR = process.env.VERY_SECRET_VAR
  const INSIDE_PUBLIC_ENV_VAR = process.env.EXISTING_VAR

  return {
    props: {
      arg,
      envVars: {
        INSIDE_PRIVATE_ENV_VAR,
        INSIDE_PUBLIC_ENV_VAR,
      }
    },
  }
}
