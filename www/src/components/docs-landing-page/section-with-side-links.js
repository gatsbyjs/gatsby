/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'

const SectionWithSideLinks = ({ links, children }) => {
  const containerStyles = {
    display: "flex",
    flexDirection: "row"
  }

  return (
    <section sx={containerStyles}>
      <div sx={{
        width: "50%",
        minWidth: "400px",
        "> :first-child": {
          marginTop: 0,
        }
      }}>
        {children}
      </div>
      <div>
        <p sx={{
          textTransform: "uppercase",
        }}>
          Most Popular
          </p>
        <ul>
          {links && links.map(link => (
            <li>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default SectionWithSideLinks