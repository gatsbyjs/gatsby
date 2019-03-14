import React, { Component } from "react"
import { Link } from "gatsby"
import { rhythm, options } from "../../utils/typography"
import presets, { colors, space, dimensions } from "../../utils/presets"
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
//         color: colors.white,
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
            [breakpoints.sm]: {
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
    flexDirection: `row`,
    alignItems: `center`,
    borderBottom: `1px solid ${colors.ui.light}`,
    backgroundColor: `rgba(255,255,255,0.975)`,
    zIndex: `2`,
    padding: `0 ${rhythm(space[6])}`,
    height: dimensions.headerHeight,
    fontFamily: options.headerFontFamily.join(`,`),
  },
  creatorsLink: {
    "&&": {
      fontSize: presets.scale[4],
      color: colors.gatsby,
      borderBottom: `none`,
      marginRight: rhythm(space[3]),
      "&:hover": {
        backgroundColor: `initial`,
      },
    },
  },
  CreatorsHeaderLink: {
    "&&": {
      fontSize: presets.scale[2],
      lineHeight: presets.lineHeights.solid,
      letterSpacing: presets.letterSpacings.tracked,
      textTransform: `uppercase`,
      fontWeight: `normal`,
      borderBottom: `none`,
      padding: `${rhythm(space[1])} ${rhythm(space[2])}`,
      marginRight: rhythm(space[2]),
      borderRadius: 40,
      "&:hover": {
        backgroundColor: colors.gatsby,
        color: colors.white,
      },
    },
  },
  filter: {
    border: `1px solid ${colors.ui.bright}`,
    borderRadius: 40,
    margin: `${rhythm(space[6])} ${rhythm(space[1])}`,
    paddingLeft: rhythm(space[1]),
    paddingRight: rhythm(space[3]),
    display: `flex`,
    alignItems: `center`,
    justifyContent: `space-between`,
    color: colors.gatsby,
    cursor: `pointer`,
  },
  input: {
    appearance: `none`,
    width: rhythm(space[4]),
    height: rhythm(space[4]),
    border: `1px solid ${colors.ui.bright}`,
    borderRadius: 40,
    marginRight: `${rhythm(space[2])}`,
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
