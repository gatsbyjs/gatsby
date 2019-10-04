import path from "path"
import ShadowingPlugin from "../"

describe(`Component Shadowing`, () => {
  it(`gets matching themes`, () => {
    const plugin = new ShadowingPlugin({
      themes: [`a-theme`, `theme-b`, `gatsby-theme-c`, `@orgname/theme-d`].map(
        name => {
          return {
            themeName: name,
            themeDir: path.join(path.sep, `some`, `place`, name),
          }
        }
      ),
    })
    expect(
      // simple request path to a theme's component
      plugin.getMatchingThemesForPath(
        path.join(
          path.sep,
          `some`,
          `place`,
          `a-theme`,
          `src`,
          `components`,
          `a-component`
        )
      )
    ).toEqual([
      {
        themeDir: path.join(path.sep, `some`, `place`, `a-theme`),
        themeName: `a-theme`,
      },
    ])

    expect(
      // request to a shadowed component in theme b
      // component-path is expected to be `a-theme/components/a-component`
      plugin.getMatchingThemesForPath(
        path.join(
          path.sep,
          `some`,
          `place`,
          `theme-b`,
          `src`,
          `a-theme`,
          `components`,
          `a-component`
        )
      )
    ).toEqual([
      {
        themeDir: path.join(path.sep, `some`, `place`, `theme-b`),
        themeName: `theme-b`,
      },
    ])
  })

  it(`can determine if the request path is in the shadow chain for the issuer`, () => {
    const plugin = new ShadowingPlugin({
      themes: [`a-theme`, `theme-b`, `gatsby-theme-c`, `@orgname/theme-d`].map(
        name => {
          return {
            themeName: name,
            themeDir: path.join(path.sep, `some`, `node_modules`, name),
          }
        }
      ),
    })
    expect(
      plugin.requestPathIsIssuerShadowPath({
        // issuer is in `theme-b`
        issuerPath: path.join(
          path.sep,
          `some`,
          `node_modules`,
          `theme-b`,
          `src`,
          `a-theme`,
          `components`,
          `a-component`
        ),
        // require'ing a file it is a "shadow child" of in a-theme
        requestPath: path.join(
          path.sep,
          `some`,
          `node_modules`,
          `a-theme`,
          `src`,
          `components`,
          `a-component`
        ),
        userSiteDir: path.join(path.sep, `some`),
      })
    ).toEqual(true)

    expect(
      plugin.requestPathIsIssuerShadowPath({
        // issuer is in `theme-b`
        issuerPath: path.join(
          path.sep,
          `some`,
          `node_modules`,
          `theme-b`,
          `src`,
          `a-theme`,
          `components`,
          `a-component`
        ),
        // require'ing a file it is NOT a "shadow child" of, also in theme-b
        // the `component-path` here would be "components/a-component"
        requestPath: path.join(
          path.sep,
          `some`,
          `node_modules`,
          `theme-b`,
          `src`,
          `components`,
          `a-component`
        ),
        userSiteDir: path.join(path.sep, `some`),
      })
    ).toEqual(false)

    expect(
      plugin.requestPathIsIssuerShadowPath({
        // issuer is in the user's site
        issuerPath: path.join(
          path.sep,
          `some`,
          `src`,
          `theme-b`,
          `components`,
          `a-component`
        ),
        // require'ing a file it is a "shadow child" of
        requestPath: path.join(
          path.sep,
          `some`,
          `node_modules`,
          `theme-b`,
          `src`,
          `components`,
          `a-component`
        ),
        userSiteDir: path.join(path.sep, `some`),
      })
    ).toEqual(true)

    expect(
      plugin.requestPathIsIssuerShadowPath({
        // issuer is in the user's site
        issuerPath: path.join(
          path.sep,
          `some`,
          `src`,
          `@orgname`,
          `theme-d`,
          `components`,
          `a-component`
        ),
        // require'ing a file it is a "shadow child" of
        requestPath: path.join(
          path.sep,
          `some`,
          `node_modules`,
          `@orgname`,
          `theme-d`,
          `src`,
          `components`,
          `a-component`
        ),
        userSiteDir: path.join(path.sep, `some`),
      })
    ).toEqual(true)
  })
})
