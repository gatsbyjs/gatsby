/** @jsx jsx */
import { Styled, jsx } from "theme-ui"

const PostDate = props => (
  <Styled.p
    sx={{
      fontSize: 1,
      mt: -3,
      mb: 3,
    }}
    {...props}
  />
)

export default PostDate
