/** @jsx jsx */
import { useState, useEffect } from "react"
import { jsx } from "theme-ui"

const ClientDataExample = () => {
  const [starsCount, setStarsCount] = useState(0)
  useEffect(() => {
    // get data from GitHub api
    fetch(`https://api.github.com/repos/gatsbyjs/gatsby`)
      .then(response => response.json()) // parse JSON from request
      .then(resultData => {
        setStarsCount(resultData.stargazers_count)
      }) // set data for the number of stars
  }, [])
  return (
    <div
      sx={{
        border: theme => `1px solid ${theme.colors.pullquote.borderColor}`,
        borderRadius: `2`,
        padding: `3`,
        marginBottom: `2`,
      }}
    >
      <span>
        Star count for the Gatsby repo: <b>{starsCount}</b>
      </span>
    </div>
  )
}

export default ClientDataExample
