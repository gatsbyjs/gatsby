import React from "react"
import YAMLData from "../../content/My-YAML-Content.yaml"

const YAMLbuildtime = () => (
  <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
    <h1>{YAMLData.title}</h1>
    <ul>
      {YAMLData.content.map((data, index) => (
        <li key={`content_item_${index}`}>{data.item}</li>
      ))}
    </ul>
  </div>
)
export default YAMLbuildtime
