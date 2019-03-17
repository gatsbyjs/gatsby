import React from "react"
import uuid from "uuid"
import JSONData from "../../content/client-data.json"
const ClientJSON = () => (
  <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
    <h1>{JSONData.title}</h1>
    <div>
      {JSONData.content.map(data => (
        <div key={`content_item_${uuid.v4()}`}>{data.item}</div>
      ))}
    </div>
  </div>
)
export default ClientJSON
