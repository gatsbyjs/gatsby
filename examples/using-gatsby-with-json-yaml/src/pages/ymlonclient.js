import React from "react"
import uuid from "uuid"
import YAMLData from "../../content/client-data.yaml"

const ClientYAML = () => (
  <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
    <h1>{YAMLData.title}</h1>
    <div>
      {YAMLData.content.map(data => (
        <div key={`content_item_${uuid.v4()}`}>{data.item}</div>
      ))}
    </div>
  </div>
)
export default ClientYAML
