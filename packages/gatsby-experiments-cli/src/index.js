const React = require("react")
const { render } = require("ink")
const MultiSelect = require("ink-multi-select").default
const { GatsbyExperiments } = require(`gatsby-recipes`)
const _ = require(`lodash`)

const experiments = require(`../gatsby/dist/experiments`).activeExperiments

const Demo = () => {
  const handleSubmit = async items => {
    // `items` = [{ label: 'First', value: 'first' }, { label: 'Third', value: 'third' }]
    console.log({ items })
    const currentExperiments = await GatsbyExperiments.all({
      root: `/Users/kylemathews/programs/blog`,
    })
    console.log({ currentExperiments })

    const selected = items.map(i => i.value)
    const experimentNames = currentExperiments.map(e => e.id)
    console.log({ selected, experimentNames })

    // Add experiments that are selected but not already in the gatsby-config.js
    const toAdd = _.without(selected, ...experimentNames)

    // Remove experiments that are no longer selected but _are_ in the gatsby-config.js
    const toRemove = _.without(experimentNames, ...selected)

    console.log({ toAdd, toRemove })

    toAdd.forEach(item => {
      GatsbyExperiments.create(
        { root: `/Users/kylemathews/programs/blog` },
        { name: item }
      )
    })
    toRemove.forEach(item => {
      GatsbyExperiments.destroy(
        { root: `/Users/kylemathews/programs/blog` },
        { name: item }
      )
    })
  }

  const newItems = experiments.map(experiment => {
    const selectItem = {
      label: `${experiment.name} - ${experiment.description}`,
      value: experiment.name,
    }
    return selectItem
  })

  return <MultiSelect items={newItems} onSubmit={handleSubmit} />
}

render(<Demo />)
