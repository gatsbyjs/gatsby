import React from "react"

export const DefaultLayout = props => (
    <div>
      <h1>Example showing Medium posts</h1>

      <main>
        {props.children()}
      </main>
    </div>
  )

export default DefaultLayout
