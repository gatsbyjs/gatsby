/** @jsx jsx */
import { graphql, useStaticQuery } from "gatsby"
import { jsx } from "theme-ui"

const BuildDataExample = () => {
  const gatsbyRepoData = useStaticQuery(graphql`
    query {
      example {
        url
        nameWithOwner
      }
    }
  `)
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
        Build Time Data: Gatsby repo{` `}
        <a href={gatsbyRepoData.example.url}>
          {gatsbyRepoData.example.nameWithOwner}
        </a>
      </span>
    </div>
  )
}

export default BuildDataExample
