/** @jsx jsx */
import { useState, useEffect } from "react"
import { jsx } from "theme-ui"

const ClientDataExample = () => {
  const [starsCount, setStarsCount] = useState(0)
  useEffect(() => {
    const fetchData = async () => {
      // get data from GitHub api
      const result = await fetch(`https://api.github.com/repos/gatsbyjs/gatsby`)
      // parse JSON from request
      const resultData = await result.json()
      // set data for the number of stars
      setStarsCount(resultData.stargazers_count)
    }
    fetchData()
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
