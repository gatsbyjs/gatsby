import React from 'react'
import './search.css'
const DataTable = props => (
  <table>
    <thead>
      <tr>
        <th>Book ISBN</th>
        <th>Book Title</th>
        <th>Book Author</th>
      </tr>
    </thead>
    <tbody>
      {props.data.map(item => (
        <tr key={`row_${item.isbn}`}>
          <td>{item.isbn}</td>
          <td>{item.title}</td>
          <td>{item.author}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

export default DataTable
