import React from 'react'
import { Table } from 'semantic-ui-react'

const DataTable = props => (
  <Table celled>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Book ISBN</Table.HeaderCell>
        <Table.HeaderCell>Book Title</Table.HeaderCell>
        <Table.HeaderCell>Book Author</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {/* eslint-disable */}
      {props.data.map(item => {
        return (
          <Table.Row key={`row_${item.isbn}`}>
            <Table.Cell>{item.isbn}</Table.Cell>
            <Table.Cell>{item.title}</Table.Cell>
            <Table.Cell>{item.author}</Table.Cell>
          </Table.Row>
        )
      })}
    </Table.Body>
  </Table>
)

export default DataTable
