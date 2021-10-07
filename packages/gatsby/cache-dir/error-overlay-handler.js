const errorMap = {}

const handleErrorOverlay = () => {
  const errors = Object.entries(errorMap)
  const runtimeErrorsToDisplay = []
  const graphqlErrorsToDisplay = []
  if (errors.length > 0) {
    errors.forEach(([id, errorValue]) => {
      if (Array.isArray(errorValue)) {
        errorValue = errorValue.filter(Boolean)
      } else {
        errorValue = [errorValue]
      }
      if (id.startsWith(`getServerData`)) {
        runtimeErrorsToDisplay.push(...errorValue)
      } else {
        graphqlErrorsToDisplay.push(...errorValue)
      }
    })
  }

  if (graphqlErrorsToDisplay.length > 0) {
    window._gatsbyEvents.push([
      `FAST_REFRESH`,
      {
        action: `SHOW_GRAPHQL_ERRORS`,
        payload: graphqlErrorsToDisplay,
      },
    ])
  } else {
    window._gatsbyEvents.push([
      `FAST_REFRESH`,
      { action: `CLEAR_GRAPHQL_ERRORS` },
    ])
  }

  if (runtimeErrorsToDisplay.length > 0) {
    window._gatsbyEvents.push([
      `FAST_REFRESH`,
      {
        action: `SHOW_GETSERVERDATA_ERRORS`,
        payload: runtimeErrorsToDisplay,
      },
    ])
  } else {
    window._gatsbyEvents.push([
      `FAST_REFRESH`,
      { action: `CLEAR_GETSERVERDATA_ERRORS` },
    ])
  }
}

export const clearError = errorID => {
  delete errorMap[errorID]
  handleErrorOverlay()
}

export const reportError = (errorID, error) => {
  if (error) {
    errorMap[errorID] = error
  }
  handleErrorOverlay()
}
