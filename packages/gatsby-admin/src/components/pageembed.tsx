/* @jsx jsx */
import { jsx } from "theme-ui"

const PageEmbed: React.FC<{ src: string; height: number }> = props => (
  <iframe
    src={props.src}
    scrolling="no"
    sx={{
      border: `none`,
      boxShadow: `floating`,
      borderRadius: 2,
      // NOTE(@mxstbr): This is a really hacky way to scale an iframe. Maybe there's a better one?
      width: `200%`,
      height: `${props.height}px`,
      marginBottom: `-${props.height / 2}px`,
      transform: `scale(0.5)`,
      transformOrigin: `0 0`,
    }}
  />
)

export default PageEmbed
