import * as React from "react"

const ClientOnlySplatNamePage = ({ params }) => {
  return (
    <main>
      <h1 data-testid="title">{params.name}</h1>
      <pre>
        <code>{JSON.stringify(params, null, 2)}</code>
      </pre>
    </main>
  )
}

export default ClientOnlySplatNamePage
