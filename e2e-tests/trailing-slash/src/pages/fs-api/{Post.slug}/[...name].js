import * as React from "react"

const ClientOnlyNestedNamePage = ({ params }) => {
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

export default ClientOnlyNestedNamePage