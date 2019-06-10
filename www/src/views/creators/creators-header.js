import React, { Component } from "react"
import { Link } from "gatsby"
import {
  colors,
  space,
  sizes,
  fontSizes,
  lineHeights,
  letterSpacings,
  fonts,
} from "../../utils/presets"
import Checkmark from "./check.svg"
import Button from "../../components/button"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

class CreatorsHeader extends Component {
  render() {
    const { /*forHire, hiring,*/ submissionText } = this.props
    return (
      <div
        css={{
          ...styles.header,
        }}
      >
        <h1
          css={{
            display: `flex`,
            height: `100%`,
            margin: 0,
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
        </h1>
        <div
          className="creators--filters"
          css={{
            display: `flex`,
            flex: `2`,
          }}
        >
          <div
            css={{
              marginLeft: `auto`,
              display: `flex`,
              alignItems: `center`,
            }}
          >
            <Button
              small
              to="/contributing/submit-to-creator-showcase/"
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
    borderBottom: `1px solid ${colors.ui.border.subtle}`,
    backgroundColor: `rgba(255,255,255,0.975)`,
    zIndex: `2`,
    padding: `0 ${space[6]}`,
    height: sizes.headerHeight,
    fontFamily: fonts.header,
  },
  creatorsLink: {
    alignSelf: `center`,
    "&&": {
      fontSize: fontSizes[4],
      color: colors.gatsby,
      borderBottom: `none`,
      marginRight: space[3],
      "&:hover": {
        backgroundColor: `initial`,
      },
    },
  },
  CreatorsHeaderLink: {
    "&&": {
      fontSize: fontSizes[2],
      lineHeight: lineHeights.solid,
      letterSpacing: letterSpacings.tracked,
      textTransform: `uppercase`,
      fontWeight: `normal`,
      borderBottom: `none`,
      padding: `${space[1]} ${space[2]}`,
      marginRight: space[2],
      borderRadius: 40,
      "&:hover": {
        backgroundColor: colors.gatsby,
        color: colors.white,
      },
    },
  },
  filter: {
    border: `1px solid ${colors.ui.border.subtle}`,
    borderRadius: 40,
    margin: `${space[6]} ${space[1]}`,
    paddingLeft: space[1],
    paddingRight: space[3],
    display: `flex`,
    alignItems: `center`,
    justifyContent: `space-between`,
    color: colors.gatsby,
    cursor: `pointer`,
  },
  input: {
    appearance: `none`,
    width: space[4],
    height: space[4],
    border: `1px solid ${colors.lavender}`,
    borderRadius: 40,
    marginRight: `${space[2]}`,
    outline: `none`,
    "&:checked": {
      backgroundColor: colors.gatsby,
      backgroundImage: `url(${Checkmark})`,
      backgroundPosition: `center`,
      backgroundRepeat: `no-repeat`,
    },
  },
  activeFilter: {
    backgroundColor: colors.lavender,
    color: colors.gatsby,
  },
}
