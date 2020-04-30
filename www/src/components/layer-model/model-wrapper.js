/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import { MdLoop } from "react-icons/md"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

// Components for building sections used in the model
const LayerContentWrapper = ({
  index,
  displayCodeFullWidth = false,
  children,
}) => {
  return (
    <div
      id={`tabpanel${index}`}
      aria-labelledby={`tab${index}`}
      role="tabpanel"
      sx={{
        pt: 4,
        px: 0,
        display: `grid`,
        gridTemplateRows: `repeat(2, auto)`,
        gridTemplateAreas: `"content" "example"`,
        gridGap: 2,
        [mediaQueries.lg]: {
          gridTemplateRows: displayCodeFullWidth ? `repeat(2, auto)` : `1fr`,
          gridTemplateColumns: displayCodeFullWidth ? `auto` : `repeat(2, 1fr)`,
          gridTemplateAreas: displayCodeFullWidth
            ? `"content" "example"`
            : `"example content"`,
          gridGap: 6,
        },
        "& p:last-child": {
          mb: 0,
        },
      }}
    >
      {children}
    </div>
  )
}

const ExampleWrapper = ({ children }) => (
  <div
    sx={{
      gridArea: `example`,
      borderRadius: 2,
      overflow: `auto`,
    }}
  >
    {children}
  </div>
)

const CodeWrapper = ({
  title,
  language,
  rotateButton = false,
  sourcesLength = 0,
  sourceIndex,
  setSourceIndex,
  children,
}) => (
  <Fragment>
    {title && (
      <div
        sx={{
          gridArea: `content`,
          position: `relative`,
          display: `flex`,
          alignItems: `center`,
          justifyContent: `space-between`,
          borderTopRightRadius: 2,
          borderTopLeftRadius: 2,
          width: `100%`,
          mx: `auto`,
        }}
        className="gatsby-code-title"
      >
        <div sx={{ fontSize: 0 }}>{title}</div>
        {rotateButton && (
          <button
            sx={{
              position: `absolute`,
              right: t => t.space[3],
              backgroundColor: `transparent`,
              border: `none`,
              color: `grey.60`,
              cursor: `pointer`,
              p: 2,
              transition: `default`,
              borderRadius: 2,
              whiteSpace: `nowrap`,
              ":focus, :hover, :active": {
                boxShadow: `floating`,
                color: `white`,
              },
              ":hover": {
                backgroundColor: `purple.40`,
              },
              ":focus": {
                backgroundColor: `purple.50`,
              },
              ":active": {
                backgroundColor: `purple.60`,
              },
              ":focus::before": {
                content: `"cycle source "`,
              },
              ":hover::before": {
                content: `"cycle source "`,
              },
            }}
            onClick={() => setSourceIndex((sourceIndex + 1) % sourcesLength)}
            aria-label="Update code source"
          >
            <MdLoop size={16} />
          </button>
        )}
      </div>
    )}
    <div className="gatsby-highlight" sx={{ width: `100%`, mx: `auto` }}>
      <pre className={`language-${language}`} sx={{ mb: 0 }}>
        <code className={`language-${language}`}>{children}</code>
      </pre>
    </div>
  </Fragment>
)

export { LayerContentWrapper, ExampleWrapper, CodeWrapper }