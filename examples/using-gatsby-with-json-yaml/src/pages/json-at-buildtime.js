import React from "react"
import JSONData from "../../content/My-JSON-Content.json"

const JSONbuildtime = () => (
  <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
    <h1>{JSONData.title}</h1>
    <ul>
      {JSONData.content.map((data, index) => (
        <li key={`content_item_${index}`}>{data.item}</li>
      ))}
    </ul>
  </div>
)
export default JSONbuildtime
