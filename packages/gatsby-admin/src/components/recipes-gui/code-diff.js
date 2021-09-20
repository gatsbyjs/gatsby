/** @jsx jsx */
import ansi2HTML from "ansi-html"
import { getTheme, Heading } from "gatsby-interface"
import { jsx, Styled } from "theme-ui"

const theme = getTheme()

ansi2HTML.setColors({
  red: theme.tones.DANGER.medium.slice(1),
  green: theme.tones.SUCCESS.medium.slice(1),
  yellow: theme.tones.WARNING.medium.slice(1),
})

const escapeTags = str => str.replace(/</g, `&lt;`)

const DiffPre = ({ resourcePlan, ...props }) => (
  <Styled.pre
    {...props}
    sx={{
      background: theme => theme.tones.BRAND.superLight,
      borderRadius: 2,
      padding: 4,
    }}
    dangerouslySetInnerHTML={{
      __html: ansi2HTML(escapeTags(resourcePlan.diff)),
    }}
  />
)

const CodeDiff = ({ resourcePlan, ...props }) => {
  if (!resourcePlan.diff) {
    return null
  }

  if (resourcePlan.resourceName === `File`) {
    return (
      <div
        sx={{
          background: theme => theme.tones.BRAND.superLight,
          border: theme => `1px solid ${theme.tones.BRAND.lighter}`,
          borderRadius: 2,
        }}
      >
        <Heading
          as="h6"
          sx={{
            px: 4,
            py: 3,
            fontWeight: `normal`,
            borderBottom: theme => `1px solid ${theme.tones.BRAND.lighter}`,
          }}
        >
          {resourcePlan.resourceDefinitions.path}
        </Heading>
        <DiffPre
          resourcePlan={resourcePlan}
          sx={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
        />
      </div>
    )
  }

  return (
    <DiffPre
      {...props}
      resourcePlan={resourcePlan}
      sx={{
        border: theme => `1px solid ${theme.tones.BRAND.lighter}`,
      }}
    />
  )
}

export default CodeDiff
