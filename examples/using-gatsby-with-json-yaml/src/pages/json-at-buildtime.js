import React from "react"
import uuid from "uuid"
import JSONData from "../../content/My-JSON-Content.json"

const JSONbuildtime = () => (
  <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
    <h1>{JSONData.title}</h1>
    <ul>
      {JSONData.content.map(data => (
        <li key={`content_item_${uuid.v4()}`}>{data.item}</li>
      ))}
    </ul>
  </div>
)
export default JSONbuildtime
