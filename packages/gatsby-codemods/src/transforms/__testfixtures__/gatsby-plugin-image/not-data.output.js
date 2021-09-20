import { GatsbyImage } from "gatsby-plugin-image";

const AssetBlock = ({ asset, maxWidth = 1280 }) => (
    <Fragment>
      <div
        css={{
          margin: `auto`,
          marginLeft: `calc(50% - 45w)`,
          marginRight: `calc(50% - 45vw)`,
  
          [mediaQueries.phablet]: {
            marginLeft: `calc(50% - 40vw)`,
            marginRight: `calc(50% - 40vw)`,
          },
          [mediaQueries.hd]: {
            marginLeft: `calc(50% - 30vw)`,
            marginRight: `calc(50% - 30vw)`,
          },
        }}
      >
        <div css={{ maxWidth: maxWidth, margin: `0 auto` }}>
          <GatsbyImage image={asset} />
        </div>
      </div>
    </Fragment>
  )