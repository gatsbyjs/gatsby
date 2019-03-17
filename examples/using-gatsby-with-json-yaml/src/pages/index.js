import React from "react"
import { Link } from "gatsby"

const IndexPage = () => (
  <div>
    <h1>Sourcing from YAML</h1>
    <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
      <ul>
        {[
          {
            itemKey: 0,
            itemPath: `/page1`,
            text: `First page that was created using YAML`,
          },
          {
            itemKey: 1,
            itemPath: `/page2`,
            text: `Second page that was created using YAML`,
          },
          {
            itemKey: 3,
            itemPath: `/page3`,
            text: `Third page that was created using YAML`,
          },
          {
            itemKey: 4,
            itemPath: `/page4`,
            text: `Fourth page that was created using YAML`,
          },
          {
            itemKey: 5,
            itemPath: `/page5`,
            text: `Fifth page that was created using YAML`,
          },
          {
            itemKey: 7,
            itemPath: `/jsononclient`,
            text: `JSON on client`,
          },
          {
            itemKey: 8,
            itemPath: `/ymlonclient`,
            text: `YML on client`,
          },
        ].map(item => (
          <li key={item.itemKey}>
            <Link to={item.itemPath}>{item.text}</Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
)

export default IndexPage
