/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import { MdLoop } from "react-icons/md"

// Wrapper for code examples used in the layer model
export default function CodeWrapper({ title, language, onRotate, children }) {
  return (
    <Fragment>
      {title && (
        <div
          sx={{
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
          {onRotate && (
            <button
              sx={{
                position: `absolute`,
                right: t => t.space[4],
                backgroundColor: `transparent`,
                border: `none`,
                color: `grey.60`,
                cursor: `pointer`,
                p: t => t.space[3],
                transition: t => t.transitions.default,
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
              onClick={onRotate}
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
}
