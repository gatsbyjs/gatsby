const pollPreviewState = async indicator => {
  const getBuildInfo = async () => {
    const res = await fetch(process.env.GATSBY_PREVIEW_API_URL, {
      mode: `cors`,
      headers: {
        "Content-Type": `application/json`,
        /*
         * NOTE: Current auth token used is the same auth token that preview exposes
         * We may want to create a read-only version of this token so that it does not have access to
         * trigger new preview builds. This behaviour can be exploited. See:
         * https://app.clubhouse.io/gatsbyjs/story/28688/cloud-runner-to-inject-site-id-and-cms-auth-token
         * for more details.
         */
        Authorization: process.env.GATSBY_PREVIEW_AUTH_TOKEN,
        "x-runner-type": `PREVIEW`,
      },
    })

    return res.json()
  }

  const indicatorSetSuccess = newBuildId => {
    indicator.textContent = `New preview available, click to navigate`
    indicator.style.color = `white`
    indicator.style.backgroundColor = `green`
    indicator.style.cursor = `pointer`
    indicator.onclick = () => {
      console.log(
        newBuildId,
        process.env.GATSBY_PREVIEW_DOMAIN,
        window.location.pathname
      )
      window.location.replace(
        `https://build-${newBuildId}${process.env.GATSBY_PREVIEW_DOMAIN}${window.location.pathname}`
      )
    }
  }

  const indicatorSetFailed = () => {
    indicator.textContent = `Latest preview build failed`
    indicator.style.color = `white`
    indicator.style.backgroundColor = `red`
    indicator.style.cursor = `text`
    indicator.onclick = null
  }

  const indicatorSetUpToDate = () => {
    indicator.textContent = `Viewing the most recent preview`
    indicator.style.color = `black`
    indicator.style.backgroundColor = `gray`
    indicator.style.cursor = `text`
    indicator.onclick = null
  }

  const indicatorSetBuilding = () => {
    indicator.textContent = `New preview currently building`
    indicator.style.color = `black`
    indicator.style.backgroundColor = `yellow`
    indicator.style.cursor = `text`
    indicator.onclick = null
  }

  setInterval(async () => {
    // currentBuild is the most recent build that is not QUEUED
    // latestBuild is the most recent build that finished running (ONLY status ERROR or SUCCESS)
    const { currentBuild, latestBuild } = await getBuildInfo()
    console.log(currentBuild, latestBuild)

    const buildId = process.env.GATSBY_BUILD_ID
    console.log(buildId)
    const currentBuildId = currentBuild?.id

    if (currentBuild?.buildStatus === `BUILDING`) {
      indicatorSetBuilding()
    } else if (currentBuild?.buildStatus === `ERROR`) {
      indicatorSetFailed()
    } else if (buildId === currentBuildId) {
      indicatorSetUpToDate()
    } else if (
      buildId !== latestBuild?.id &&
      latestBuild?.buildStatus === `SUCCESS`
    ) {
      indicatorSetSuccess(currentBuildId)
    }
  }, 3000)
}

export const onInitialClientRender = (_, { endpoint }) => {
  // Commented out for local testing purposes
  // if (process.env.RUNNER_TYPE !== 'INCREMENTAL_PREVIEW') return

  const indicator = document.createElement(`div`)
  indicator.id = `preview-indicator`
  document.body.appendChild(indicator)
  indicator.style.cssText = `position: fixed; bottom: 5px; left: 5px; background-color: gray; height: 30px; border: 1px; width: 360px; text-align: center; border-radius: 10px;`

  pollPreviewState(indicator)
}
