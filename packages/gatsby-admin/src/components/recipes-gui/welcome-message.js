/** @jsx jsx */
import { jsx, Styled } from "theme-ui"
import { BaseAnchor } from "gatsby-interface"

function WelcomeMessage() {
  return (
    <div
      sx={{
        marginTop: 8,
        marginBottom: 8,
        background: theme => theme.tones.BRAND.superLight,
        border: theme => `1px solid ${theme.tones.BRAND.light}`,
        padding: 4,
      }}
    >
      <Styled.p>
        Thank you for trying the experimental version of Gatsby Recipes! 🤗
      </Styled.p>
      <Styled.p sx={{ margin: 0 }}>
        Please ask questions, share your recipes, report bugs, and subscribe for
        updates in our umbrella issue at{` `}
        <BaseAnchor href="https://github.com/gatsbyjs/gatsby/issues/22991">
          https://github.com/gatsbyjs/gatsby/issues/22991
        </BaseAnchor>
      </Styled.p>
    </div>
  )
}

export default WelcomeMessage
