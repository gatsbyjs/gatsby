import React from "react"

const TechWithIcon = ({ icon, height, children }) => {
  let h = height ? height : `1.2em`

  return (
    <span css={{ whiteSpace: `nowrap` }}>
      {children}&nbsp;<img
        src={icon}
        css={{
          height: `${h}`,
          margin: 0,
          verticalAlign: `text-bottom`,
        }}
      />
    </span>
  )
}

export default TechWithIcon
