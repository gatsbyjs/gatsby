import React from "react"
import uuid from "uuid"
import { Link } from "gatsby"
const basicTemplate = props => {
  const { pageContext } = props
  const { pageContent, links } = pageContext

  return (
    <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
      <div>
        {pageContent.map(data => (
          <div key={uuid.v4()}>{data.item}</div>
        ))}
      </div>
      <div>
        {links.map(item => (
          <div>
            <Link to={item.to}>{item.to}</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
export default basicTemplate
