# gatsby-transformer-ipynb

Parses [jupyter](https://jupyter.org/) notebook files.

## Install

`npm install --save gatsby-transformer-ipynb`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-transformer-ipynb`]
```

## Parsing algorithm

It recognizes files with the `ipynb` extension.

Each notebook file is parsed into a node of type `JupyterNotebook`.

This plugin adds additional fields to the `JupyterNotebook` GraphQL type
including:

* `json`: the json notebook code converted into a javascript object with `JSON.parse`.
* `metadata`: jupyter notebooks can embed metadata to indicate authors, titles...
* `internal.content`: contains the raw notebook code, it can be used to feed the react component `NotebookPreview` from [`@nteract/notebook-preview`](https://github.com/nteract/nteract/tree/master/packages/notebook-preview).

## How to query

A sample GraphQL query to get JupyterNotebook nodes:

```graphql
{
  query
  JupyterQuery {
    allJupyterNotebook {
      edges {
        node {
          id
          metadata {
            kernelspec {
              name
              language
              display_name
            }
          }
          json {
            nbformat
            nbformat_minor
            cells {
              cell_type
              execution_count
            }
          }
          internal {
            content
          }
        }
      }
    }
  }
}
```
