import React from "react"
import Style from "../gatsby/cache-dir/loading-indicator/style.js"

const indicatorSetSuccess = newBuildId => {
  return {
    text: `New preview available`,
    color: `black`,
    backgroundColor: `lightgreen`,
    cursor: `pointer`,
    visible: true,
    onclick: () => {
      console.log(
        newBuildId,
        process.env.GATSBY_PREVIEW_DOMAIN,
        window.location.pathname
      )
      window.location.replace(
        `https://build-${newBuildId}${process.env.GATSBY_PREVIEW_DOMAIN}${window.location.pathname}`
      )
    },
  }
}

const indicatorSetFailed = () => {
  return {
    text: `Latest preview build failed`,
    color: `black`,
    backgroundColor: `lightcoral`,
    cursor: `text`,
    visible: true,
    onclick: null,
  }
}

const indicatorSetUpToDate = () => {
  return {
    text: `Most recent preview`,
    color: `black`,
    backgroundColor: `lightgray`,
    cursor: `text`,
    visible: false,
    onclick: null,
  }
}

const indicatorSetBuilding = () => {
  return {
    text: `New preview building`,
    color: `black`,
    backgroundColor: `lightgoldenrodyellow`,
    cursor: `text`,
    visible: true,
    onclick: null,
  }
}

const getBuildInfo = async () => {
  const res = await fetch(process.env.GATSBY_PREVIEW_API_URL, {
    mode: `cors`,
    headers: {
      "Content-Type": `application/json`,
      /*
       * NOTE: Current auth token used is the same auth token that preview exposes
       * Currently this token is only used for read-only purposes but it's good to note for the future if this changes
       */
      Authorization: process.env.GATSBY_PREVIEW_AUTH_TOKEN,
      "x-runner-type": `PREVIEW`,
    },
  })

  return res.json()
}

const Spinner = () => (
  <div data-gatsby-loading-indicator="spinner" aria-hidden="true">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
    </svg>
  </div>
)

const SuccessIcon = () => (
  <>
    <svg
      width="15"
      height="15"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="SuccessIcon"
    >
      <circle cx="10" cy="10" r="10" fill="#37B635" />
      <path
        d="M7.87721 13.7412L5.38946 10.3449C5.13934 9.98294 5.20578 9.49008 5.54283 9.20726L5.54283 9.20726C5.87988 8.92444 6.37679 8.94459 6.68984 9.25377L9.60256 12.2935C10.0767 12.7618 10.0453 13.5363 9.53479 13.9647L9.53479 13.9647C9.02432 14.393 8.25604 14.2895 7.87721 13.7412Z"
        fill="white"
      />
      <path
        d="M8.08081 13.9562C7.56224 13.521 7.51131 12.7413 7.96888 12.2424L13.7477 5.94164C14.0412 5.62168 14.5345 5.58945 14.8671 5.86853L14.8671 5.86853C15.1997 6.1476 15.2537 6.63905 14.9895 6.98362L9.78798 13.7688C9.37613 14.306 8.59938 14.3913 8.08081 13.9562L8.08081 13.9562Z"
        fill="white"
      />
      <path
        d="M8.212 10.8633C8.50311 11.2126 8.71659 11.4455 9.08533 11.0379C9.45407 10.6304 8.96889 12.0665 8.96889 12.0665L7.76562 11.6784L8.212 10.8633Z"
        fill="white"
      />
    </svg>
  </>
)

const FailedIcon = () => (
  <>
    <svg
      width="15"
      height="15"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="FailedIcon"
    >
      <circle cx="10" cy="10" r="10" fill="#FA2915" />
      <path
        d="M14.6663 6.2735L13.7263 5.3335L9.99967 9.06016L6.27301 5.3335L5.33301 6.2735L9.05967 10.0002L5.33301 13.7268L6.27301 14.6668L9.99967 10.9402L13.7263 14.6668L14.6663 13.7268L10.9397 10.0002L14.6663 6.2735Z"
        fill="white"
      />
    </svg>
  </>
)

class Indicator extends React.Component {
  state = {
    attributes: {},
    icon: ``,
  }

  componentDidMount() {
    setInterval(async () => {
      // currentBuild is the most recent build that is not QUEUED
      // latestBuild is the most recent build that finished running (ONLY status ERROR or SUCCESS)
      const { currentBuild, latestBuild } = await getBuildInfo()

      const buildId = process.env.GATSBY_BUILD_ID
      const currentBuildId = currentBuild?.id

      if (currentBuild?.buildStatus === `BUILDING`) {
        this.setState(prevState =>
          Object.assign({}, prevState, {
            attributes: indicatorSetBuilding(),
            icon: <Spinner />,
          })
        )
      } else if (currentBuild?.buildStatus === `ERROR`) {
        this.setState(prevState =>
          Object.assign({}, prevState, {
            attributes: indicatorSetFailed(),
            icon: <FailedIcon />,
          })
        )
      } else if (buildId === currentBuildId) {
        this.setState(prevState =>
          Object.assign({}, prevState, {
            attributes: indicatorSetUpToDate(),
            icon: ``,
          })
        )
      } else if (
        buildId !== latestBuild?.id &&
        latestBuild?.buildStatus === `SUCCESS`
      ) {
        this.setState(prevState =>
          Object.assign({}, prevState, {
            attributes: indicatorSetSuccess(latestBuild?.id),
            icon: <SuccessIcon />,
          })
        )
      }
    }, 3000)
  }

  render() {
    return (
      <>
        <Style />
        <div
          onClick={this.state.attributes.onclick}
          style={{
            color: this.state.attributes.color,
            backgroundColor: this.state.attributes.backgroundColor,
            cursor: this.state.attributes.cursor,
          }}
          data-gatsby-loading-indicator="root"
          data-gatsby-loading-indicator-visible={this.state.attributes.visible}
          aria-live="assertive"
        >
          {this.state.icon}
          <div data-gatsby-loading-indicator="text">
            {this.state.attributes.text}
          </div>
        </div>
        {this.props.children}
      </>
    )
  }
}

export const wrapPageElement = ({ element, props }) => (
  <>
    <Indicator {...props}>{element}</Indicator>
  </>
)
