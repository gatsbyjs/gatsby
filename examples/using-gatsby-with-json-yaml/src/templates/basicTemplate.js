import React from "react"
import uuid from "uuid"
import { Link } from "gatsby"
const basicTemplate = props => {
  const { pageContext } = props
  const { pageContent, links } = pageContext

  return (
    <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
      <ul>
        {pageContent.map(data => (
          <li key={uuid.v4()}>{data.item}</li>
        ))}
      </ul>
      <ul>
        {links.map(item => (
          <li key={uuid.v4()}>
            <Link to={item.to}>{item.to}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
export default basicTemplate
