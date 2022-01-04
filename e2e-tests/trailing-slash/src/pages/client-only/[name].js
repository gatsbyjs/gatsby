import * as React from "react"

const ClientOnlyNamePage = ({ params }) => {
  return (
    <main>
      <pre>
        <code>
          {JSON.stringify(params, null, 2)}
        </code>
      </pre>
    </main>
  )
}

export default ClientOnlyNamePage