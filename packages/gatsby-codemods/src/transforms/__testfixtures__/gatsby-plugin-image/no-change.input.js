export function CloudFeature({ content, pictures, reversed = false }) {
    return (
      <React.Fragment>
        <article css={rootCss}>
          <div css={theme => innerCss({ theme, reversed })}>
            <div css={infoCss}>
              {content.map((item, idx) => {
                const { id, data, componentName } = item
  
                let identyfier = componentName
  
                if (componentName === `Heading`) {
                  identyfier =
                    content[idx - 1] &&
                    content[idx - 1].componentName === `Heading`
                      ? `longHeading`
                      : `shortHeading`
                }
  
                return (
                  <ContentItemRenderer
                    key={id}
                    data={data}
                    componentName={componentName}
                    css={contextStyles[identyfier]}
                    {...contextProps[identyfier]}
                  />
                )
              })}
            </div>
            <div css={displayCss}>
              {pictures.map(pic => {
                const { componentName, id, data } = pic
  
                const viewportIdentifier = data?.identifier.match(
                  /mobile|desktop/g
                )[0]
  
                const mobileVersion =
                  viewportIdentifier === `mobile` ? true : false
  
                const featureIdentifier = data?.identifier.match(/(^\w+)_/)
                const heightAdjustment =
                  featureIdentifier &&
                  featureIdentifier[1] &&
                  HeightAdjustment[featureIdentifier[1]]
  
                return (
                  <ContentItemRenderer
                    key={id}
                    data={data}
                    componentName={componentName}
                    asImg={true}
                    css={theme => [
                      illuCss({ theme, heightAdjustment }),
                      mobileVersion
                        ? displayOnMobileOnly({ theme })
                        : displayOnDesktopOnly({ theme }),
                    ]}
                  />
                )
              })}
            </div>
          </div>
        </article>
      </React.Fragment>
    )
  }