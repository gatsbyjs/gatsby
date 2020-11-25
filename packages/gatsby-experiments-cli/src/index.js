const React = require(`react`)
const { render, Box, Text } = require(`ink`)
const MultiSelect = require(`ink-multi-select`).default
const { GatsbyExperiment } = require(`gatsby-recipes`)
const _ = require(`lodash`)
const { commaListsAnd } = require(`common-tags`)

const experiments =
  require(`gatsby/dist/utils/experiments`)?.default?.activeExperiments || []

const Demo = ({ projectRoot }) => {
  const [enabled, setEnabled] = React.useState()
  const [closingMessages, setClosingMessages] = React.useState()
  const handleSubmit = async items => {
    const currentExperiments = await GatsbyExperiment.all({
      root: projectRoot,
    })

    const selected = items.map(i => i.value)
    const experimentNames = currentExperiments.map(e => e.id)

    // Add experiments that are selected but not already in the gatsby-config.js
    const toAdd = _.without(selected, ...experimentNames)

    // Remove experiments that are no longer selected but _are_ in the gatsby-config.js
    const toRemove = _.without(experimentNames, ...selected)

    let promises = []

    promises = promises.concat(
      toAdd.map(item =>
        GatsbyExperiment.create({ root: projectRoot }, { name: item })
      )
    )
    promises = promises.concat(
      toRemove.map(item =>
        GatsbyExperiment.destroy({ root: projectRoot }, { name: item })
      )
    )

    await Promise.all(promises)

    const closingMessagesArry = []
    if (!_.isEmpty(toAdd)) {
      const expStr = toAdd.length > 1 ? `experiments` : `experiment`
      closingMessagesArry.push(commaListsAnd`Enabled the ${expStr} ${toAdd}`)
    }
    if (!_.isEmpty(toRemove)) {
      const expStr = toRemove.length > 1 ? `experiments` : `experiment`
      closingMessagesArry.push(commaListsAnd`Removed the ${expStr} ${toRemove}`)
    }

    if (_.isEmpty(closingMessagesArry)) {
      closingMessagesArry.push(`No changes`)
    }

    setClosingMessages(closingMessagesArry)
  }

  // Get list of current experiments
  React.useEffect(() => {
    GatsbyExperiment.all({
      root: projectRoot,
    }).then(currentExperiments => setEnabled(currentExperiments))
  }, [])

  const newItems = experiments.map(experiment => {
    const selectItem = {
      label: `${experiment.name} - ${experiment.description}`,
      value: experiment.name,
    }
    return selectItem
  })

  if (closingMessages) {
    return (
      <Box flexDirection="column">
        {closingMessages.map(m => (
          <Box key={m}>
            <Text>{m}</Text>
          </Box>
        ))}
      </Box>
    )
  } else {
    if (enabled) {
      const enabledMap = enabled.map(e => {
        const item = {
          value: e.id,
        }
        return item
      })
      return (
        <MultiSelect
          items={newItems}
          onSubmit={handleSubmit}
          defaultSelected={enabledMap}
        />
      )
    } else {
      return null
    }
  }
}

export default ({ projectRoot }) => {
  const { waitUntilExit } = render(<Demo projectRoot={projectRoot} />)
  return waitUntilExit()
}
