const React = require(`react`)
const { render } = require(`ink`)
const MultiSelect = require(`ink-multi-select`).default
const { GatsbyExperiments } = require(`gatsby-recipes`)
const _ = require(`lodash`)
const { commaListsAnd } = require(`common-tags`)

const experiments = require(`../gatsby/dist/experiments`).activeExperiments

const Demo = () => {
  const [enabled, setEnabled] = React.useState()
  const handleSubmit = async items => {
    const currentExperiments = await GatsbyExperiments.all({
      root: `/Users/kylemathews/programs/blog`,
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
        GatsbyExperiments.create(
          { root: `/Users/kylemathews/programs/blog` },
          { name: item }
        )
      )
    )
    promises = promises.concat(
      toRemove.map(item =>
        GatsbyExperiments.destroy(
          { root: `/Users/kylemathews/programs/blog` },
          { name: item }
        )
      )
    )

    await Promise.all(promises)

    if (!_.isEmpty(toAdd)) {
      console.log(commaListsAnd`Enabled the experiments ${toAdd}`)
    }
    if (!_.isEmpty(toRemove)) {
      console.log(commaListsAnd`Removed the experiments ${toRemove}`)
    }

    process.exit()
  }

  // Get list of current experiments
  React.useEffect(() => {
    GatsbyExperiments.all({
      root: `/Users/kylemathews/programs/blog`,
    }).then(currentExperiments => setEnabled(currentExperiments))
  }, [])

  const newItems = experiments.map(experiment => {
    const selectItem = {
      label: `${experiment.name} - ${experiment.description}`,
      value: experiment.name,
    }
    return selectItem
  })

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

render(<Demo />)
