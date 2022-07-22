export const OPERATION_STATUS_QUERY = `
  query OPERATION_STATUS {
    currentBulkOperation {
      id
      status
      errorCode
      createdAt
      completedAt
      objectCount
      fileSize
      url
      partialDataUrl
      query
    }
  }
`

export const OPERATION_BY_ID = `
  query OPERATION_BY_ID($id: ID!) {
    node(id: $id) {
      ... on BulkOperation {
        id
        status
        errorCode
        createdAt
        completedAt
        objectCount
        fileSize
        url
        partialDataUrl
        query
      }
    }
  }
  `

export const CANCEL_OPERATION = `
  mutation CANCEL_OPERATION($id: ID!) {
    bulkOperationCancel(id: $id) {
      bulkOperation {
        status
      }
      userErrors {
        field
        message
      }
    }
  }
  `
