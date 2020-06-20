/** @jsx jsx */
import { jsx, Box } from "theme-ui"

export default function BoxWithBorder({ withBorder, children, ...rest }) {
  return (
    <Box
      sx={{
        borderRadius: 1,
        position: `relative`,
        ":after": withBorder && {
          content: `" "`,
          border: `1px solid ${t.colors.blackFade[10]}`,
          borderRadius: t => t.radii[1],
          position: `absolute`,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      }}
      {...rest}
    >
      {children}
    </Box>
  )
}
