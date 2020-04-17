/** @jsx jsx */
import { Styled, jsx } from "theme-ui"
import { Link } from "gatsby"

const PostLink = ({ title, slug, date, excerpt }) => (
  <div>
    <Styled.h2
      sx={{
        mb: 1,
      }}
    >
      <Styled.a
        as={Link}
        sx={{
          textDecoration: `none`,
        }}
        to={slug}
      >
        {title || slug}
      </Styled.a>
    </Styled.h2>
    <small>{date}</small>
    <Styled.p>{excerpt}</Styled.p>
  </div>
)

export default PostLink
