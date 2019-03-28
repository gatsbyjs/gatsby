import React from "react"
import uuid from "uuid"
import YAMLData from "../../content/My-YAML-Content.yaml"

const YAMLbuildtime = () => (
  <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
    <h1>{YAMLData.title}</h1>
    <ul>
      {YAMLData.content.map(data => (
        <li key={`content_item_${uuid.v4()}`}>{data.item}</li>
      ))}
    </ul>
  </div>
)
export default YAMLbuildtime
