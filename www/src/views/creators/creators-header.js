import React, { Component } from "react"
import { Link } from "gatsby"
import typography, { rhythm, scale } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"
import Checkmark from "./check.svg"
import Button from "../../components/button"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

// const CreatorsHeaderLink = ({ linkTo, children }) => (
//   <li
//     css={{
//       display: `flex`,
//       alignItems: `center`,
//       margin: 0,
//     }}
//   >
//     <Link
//       to={linkTo}
//       state={{ filter: `` }}
//       activeStyle={{
//         backgroundColor: colors.gatsby,
//         color: `white`,
//       }}
//       css={{
//         ...styles.CreatorsHeaderLink,
//       }}
//     >
//       {children}
//     </Link>
//   </li>
// )

class CreatorsHeader extends Component {
  render() {
    const { /*forHire, hiring,*/ submissionText } = this.props
    return (
      <div
        css={{
          ...styles.header,
        }}
      >
        <Link
          to="/creators/"
          state={{ filter: `` }}
          css={{
            ...styles.creatorsLink,
          }}
        >
          Creators
        </Link>
        {/* <nav
          role="navigation"
          css={{
            display: `flex`,
            justifyContent: `space-between`,
            alignItems: `center`,
            [presets.Phablet]: {
              justifyContent: `flex-start`,
            },
          }}
        >
          <CreatorsHeaderLink linkTo="/creators/">All</CreatorsHeaderLink>
          <CreatorsHeaderLink linkTo="/creators/people/">
            People
          </CreatorsHeaderLink>
          <CreatorsHeaderLink linkTo="/creators/agencies/">
            Agencies
          </CreatorsHeaderLink>
          <CreatorsHeaderLink linkTo="/creators/companies/">
            Companies
          </CreatorsHeaderLink>
        </nav> */}
        <div
          className="creators--filters"
          css={{
            display: `flex`,
            flex: `2`,
          }}
        >
          {/* <label
            className="label"
            css={[styles.filter, forHire && styles.activeFilter]}
          >
            <input
              type="checkbox"
              name="forHire"
              css={{
                ...styles.input,
              }}
              checked={forHire}
              onChange={() => this.props.applyFilter(`for_hire`)}
              disabled={hiring}
            />
            For Hire
          </label>
          <label
            className="label"
            css={[styles.filter, hiring && styles.activeFilter]}
          >
            <input
              type="checkbox"
              name="hiring"
              css={{
                ...styles.input,
              }}
              checked={hiring}
              onChange={() => this.props.applyFilter(`hiring`)}
              disabled={forHire}
            />
            Hiring
          </label> */}
          <div
            css={{
              marginLeft: `auto`,
              display: `flex`,
              alignItems: `center`,
            }}
          >
            <Button
              small
              to="/docs/submit-to-creator-showcase/"
              icon={<ArrowForwardIcon />}
            >
              {submissionText}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

export default CreatorsHeader

const styles = {
  header: {
    display: `flex`,
    // flexDirection: `column`,
    flexDirection: `row`,
    alignItems: `center`,
    borderBottom: `1px solid ${colors.ui.light}`,
    backgroundColor: `rgba(255,255,255,0.975)`,
    zIndex: `2`,
    // padding: `${rhythm(2 / 4)} ${rhythm(3 / 4)} 0 ${rhythm(3 / 4)}`,
    padding: `0 ${rhythm(3 / 4)}`,
    height: presets.headerHeight,
    fontFamily: typography.options.headerFontFamily.join(`,`),
  },
  creatorsLink: {
    "&&": {
      ...scale(1 / 3),
      // display: `none`,
      color: colors.gatsby,
      boxShadow: `none`,
      borderBottom: `none`,
      marginRight: rhythm(1 / 2),
      "&:hover": {
        backgroundColor: `initial`,
      },
      [presets.Desktop]: {
        // display: `inline`,
      },
    },
  },
  CreatorsHeaderLink: {
    "&&": {
      ...scale(-1 / 3),
      lineHeight: 1,
      letterSpacing: `0.03em`,
      textTransform: `uppercase`,
      fontWeight: `normal`,
      boxShadow: `none`,
      borderBottom: `none`,
      padding: `${rhythm(typography.options.blockMarginBottom / 4)} .5rem`,
      marginRight: rhythm(1 / 3),
      borderRadius: 40,
      "&:hover": {
        backgroundColor: colors.gatsby,
        color: `white`,
      },
    },
  },
  filter: {
    border: `1px solid ${colors.ui.bright}`,
    borderRadius: `40px`,
    margin: `${rhythm(3 / 4)} ${rhythm(1 / 6)}`,
    paddingLeft: rhythm(1 / 4),
    paddingRight: rhythm(1 / 4),
    display: `flex`,
    alignItems: `center`,
    justifyContent: `space-between`,
    color: colors.gatsby,
    cursor: `pointer`,
  },
  input: {
    appearance: `none`,
    width: `1rem`,
    height: `1rem`,
    border: `1px solid ${colors.ui.bright}`,
    borderRadius: `40px`,
    marginRight: `${rhythm(1 / 4)}`,
    outline: `none`,
    "&:checked": {
      backgroundColor: colors.gatsby,
      backgroundImage: `url(${Checkmark})`,
      backgroundPosition: `center`,
      backgroundRepeat: `no-repeat`,
    },
  },
  activeFilter: {
    backgroundColor: colors.ui.bright,
    color: colors.gatsby,
  },
}
