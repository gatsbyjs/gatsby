/** @jsx jsx */
import { jsx } from "theme-ui"
import { MdCreate as EditIcon } from "react-icons/md"

export default function MarkdownPageFooter({ path }) {
  return (
    <div sx={{ display: `flex`, alignItems: `center`, mt: 9 }}>
      <a
        sx={{ variant: `links.muted` }}
        href={`https://github.com/gatsbyjs/gatsby/blob/master/docs/${path}`}
      >
        <EditIcon sx={{ mr: 2 }} /> Edit this page on GitHub
      </a>
    </div>
  )
}
