/** @jsx jsx */
import { jsx, Box } from "theme-ui"

export default function ImagePlaceholder({ aspectRatio, ...props }) {
  return (
    <Box
      sx={{
        bg: `grey.10`,
        flex: `0 0 auto`,
        height: 0,
        width: `100%`,
        pb: aspectRatio ? `${aspectRatio * 100}%` : `${(9 / 16) * 100}%`,
        ...props,
      }}
    />
  )
}
