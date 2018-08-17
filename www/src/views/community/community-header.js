import React, { Component } from "react"
import { Link } from "gatsby"
import { rhythm, scale } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"
import Checkmark from "./check.svg"

const CommunityHeaderLink = ({ linkTo, children }) => (
  <li
    css={{
      display: `flex`,
      alignItems: `center`,
      margin: 0,
    }}
  >
    <Link
      to={linkTo}
      activeStyle={{
        backgroundColor: colors.gatsby,
        color: `white`,
      }}
      css={{
        "&&": {
          textTransform: `uppercase`,
          ...scale(-1 / 4),
          fontWeight: `600`,
          boxShadow: `none`,
          borderBottom: `none`,
          padding: `${rhythm(1 / 4)} 1rem`,
          margin: `0 ${rhythm(1 / 6)}`,
          borderRadius: `40px`,
          "&:hover": {
            backgroundColor: colors.gatsby,
            color: `white`,
          },
        },
      }}
    >
      {children}
    </Link>
  </li>
)

class CommunityHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      forHire: false,
      hiring: false,
    }
  }

  handleInputChange = event => {
    const target = event.target
    const value = target.type === `checkbox` ? target.checked : target.value
    const name = target.name
    // if (!this.state.forHire) {
    //   this.setState({ forHire: true })
    // } else {
    //   this.setState({ forHire: false })
    // }

    this.setState({
      [name]: value,
    })
  }

  render() {
    const { forHire, hiring } = this.state
    return (
      <header
        role="header"
        css={{
          display: `flex`,
          alignItems: `center`,
          width: `100vw`,
          borderBottom: `1px solid ${colors.ui.light}`,
          backgroundColor: `rgba(255,255,255,0.975)`,
          height: presets.headerHeight,
          zIndex: `2`,
          paddingLeft: rhythm(3 / 4),
          paddingRight: rhythm(3 / 4),
        }}
      >
        <Link
          to="/community/"
          css={{
            "&&": {
              ...scale(1 / 3),
              color: colors.gatsby,
              boxShadow: `none`,
              borderBottom: `none`,
              marginRight: rhythm(1 / 2),
            },
          }}
        >
          Creators
        </Link>
        <nav
          role="navigation"
          css={{
            display: `flex`,
            justifyContent: `space-around`,
            alignItems: `center`,
          }}
        >
          <CommunityHeaderLink linkTo="/community/">All</CommunityHeaderLink>
          <CommunityHeaderLink linkTo="/community/people/">
            People
          </CommunityHeaderLink>
          <CommunityHeaderLink linkTo="/community/agencies/">
            Agencies
          </CommunityHeaderLink>
          <CommunityHeaderLink linkTo="/community/companies/">
            Companies
          </CommunityHeaderLink>
        </nav>
        <div
          className="community--filters"
          css={{
            display: `flex`,
          }}
        >
          <label
            className="label"
            css={[styles.filter, forHire && styles.activeFilter]}
          >
            <input
              type="checkbox"
              name="forHire"
              css={{
                ...styles.input,
                "&:checked + label": {
                  background: `red`,
                },
              }}
              checked={this.state.forHire}
              onChange={this.handleInputChange}
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
              checked={this.state.hiring}
              onChange={this.handleInputChange}
            />
            Hiring
          </label>
        </div>
      </header>
    )
  }
}

export default CommunityHeader

const styles = {
  filter: {
    border: `1px solid ${colors.ui.bright}`,
    borderRadius: `40px`,
    margin: `0 ${rhythm(1 / 6)}`,
    paddingLeft: rhythm(1 / 4),
    paddingRight: rhythm(1 / 4),
    display: `flex`,
    alignItems: `center`,
    justifyContent: `space-between`,
    color: colors.gatsby,
    fontFamily: `Futura PT`,
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
