const Promise = require(`bluebird`)
const _ = require(`lodash`)

const { onCreateNode } = require(`../gatsby-node`)

const test_notebook = `{
  "cells": [
    {
      "cell_type": "markdown",
      "source": [
        "This is a jupyter notebook running [Node.js](https://nodejs.org)."
      ],
      "metadata": {}
    },
    {
      "cell_type": "code",
      "source": [
        "# nodejs code",
        "process.version"
      ],
      "outputs": [
        {
          "output_type": "execute_result",
          "execution_count": 3,
          "data": {
            "text/plain": [
              "'v8.2.1'"
            ]
          },
          "metadata": {}
        }
      ],
      "execution_count": 3,
      "metadata": {
        "collapsed": false,
        "outputHidden": false,
        "inputHidden": false
      }
    }
  ],
  "metadata": {
    "kernel_info": {
      "name": "node_nteract"
    },
    "kernelspec": {
      "name": "node_nteract",
      "language": "javascript",
      "display_name": "Node.js (nteract)"
    },
    "language_info": {
      "name": "javascript",
      "version": "8.2.1",
      "mimetype": "application/javascript",
      "file_extension": ".js"
    },
    "nteract": {
      "version": "0.8.4"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 4
}`

describe(`Process notebook if extension is ipynb`, () => {
  const node = {
    id: `whatever`,
    children: [],
    extension: `ipynb`,
    internal: {
      contentDigest: `whatever`,
    },
  }

  // Make some fake functions its expecting.
  const loadNodeContent = node => Promise.resolve(node.content)

  describe(`Process generated notebook node correctly`, () => {
    it(`Correctly creates a new JupyterNotebook node`, async () => {
      const content = test_notebook
      node.content = content

      const createNode = jest.fn()
      const createParentChildLink = jest.fn()
      const boundActionCreators = {
        createNode,
        createParentChildLink,
      }

      await onCreateNode({
        node,
        loadNodeContent,
        boundActionCreators,
      }).then(() => {
        expect(createNode.mock.calls).toMatchSnapshot()
        expect(createParentChildLink.mock.calls).toMatchSnapshot()
        expect(createNode).toHaveBeenCalledTimes(1)
        expect(createParentChildLink).toHaveBeenCalledTimes(1)
      })
    })

    it(`Correctly parses metadata fields`, async () => {
      const content = test_notebook

      node.content = content

      const createNode = jest.fn()
      const createParentChildLink = jest.fn()
      const boundActionCreators = {
        createNode,
        createParentChildLink,
      }

      await onCreateNode({
        node,
        loadNodeContent,
        boundActionCreators,
      }).then(() => {
        expect(createNode.mock.calls).toMatchSnapshot()
        expect(createNode.mock.calls[0][0].metadata).not.toEqual(0)
        expect(_.isNumber(createNode.mock.calls[0][0].metadata.nbformat))
        expect(createParentChildLink.mock.calls).toMatchSnapshot()
        expect(createNode).toHaveBeenCalledTimes(1)
        expect(createParentChildLink).toHaveBeenCalledTimes(1)
      })
    })
  })

  // TODO: test graphql query as in remark plugin
})
