import React, { Component } from 'react'
import EvaluationCell from './evaluation-cell'

class EvaluationTable extends Component {
  render() {
    const superHeaderTitles = [
      ``,
      ``,
      ``,
      `Gatsby`,
      `Static frameworks`,
      `Open-source CMS`,
      `Site builders`,
    ]
    const subHeaderTitles = [
      `Category`,
      `Subcategory`,
      `Feature`,
      <img
        src={`https://camo.githubusercontent.com/9c70ec950802d744cd3bccaa97fadbfdd7c8f2a9/68747470733a2f2f7777772e6761747362796a732e6f72672f6761747362792d6e656761746976652e737667`}
        height={`30`}
        style={{ marginBottom: 0, display: `block`, margin: `auto` }}
      />,
      <img
        src={`https://cdn.worldvectorlogo.com/logos/jekyll.svg`}
        height={`30`}
        style={{ marginBottom: 0, display: `block`, margin: `auto` }}
      />,
      <img
        src={`https://s.w.org/about/images/logos/wordpress-logo-notext-rgb.png`}
        height={`30`}
        style={{ marginBottom: 0, display: `block`, margin: `auto` }}
      />,
      <img
        src={`http://retipster.com/wp-content/uploads/2015/07/iu.gif`}
        height={`30`}
        style={{ marginBottom: 0, display: `block`, margin: `auto` }}
      />,
    ]
    const headers = [
      `Category`,
      `Subcategory`,
      `Feature`,
      `Gatsby`,
      `Jekyll`,
      `Wordpress`,
      `Squarespace`,
    ]
    const renderCell = (text, column) => {
      switch(column) {
        case 0: {
          return (
            <div
              style={{
                position: `relative`,
                top: 50,
                "-webkit-transform": `rotate(-90deg)`,
              }}
            >
              { text }
            </div>
          )
        }
        case 1: {
          return (
            <div
              style={{
                padding: 10,
                verticalAlign: `middle`,
                maxWidth: 200,
              }}
            >
              { text }
            </div>
          )
        }
        case 2: {
          return (
            <div
              style={{
                padding: 10,
                verticalAlign: `middle`,
                maxWidth: 200,

              }}
            >
              { text }
            </div>
          )
        }
        case 3:
        case 4:
        case 5:
        case 6: {
          return (
            <div
              style={{
                position: `relative`,
                top: 15,
                margin: `auto`,
                height: 42,
                width: 42,
              }}
            >
              <EvaluationCell
                num={text}
              />
            </div>
          )
        }

      }
    }

    return (
      <div>
        <div style={{
          display: `table`,
          color: `#9d9d9d`,
          marginLeft: 20,
          borderBottom: `1px solid #dddddd`,
          borderRight: `1px solid #dddddd`,
        }}>
          <div style={{ display: `table-row` }}>
            {
              superHeaderTitles.map((header, i) => (
                <div style={{
                  display: `table-cell`,
                  borderBottom: i > 2 ? `1px solid #dddddd` : `none`,
                  padding: 10,
                  textTransform: `uppercase`,
                  fontSize: `80%`,
                  fontWeight: 600,
                  textAlign: `center`,
                  verticalAlign: `bottom`,
                }}>
                  { header }
                </div>
              ))
            }
          </div>
          <div style={{ display: `table-row` }}>
            {
              subHeaderTitles.map((header, i) => (
                <div style={{
                  display: `table-cell`,
                  borderBottom: `1px solid #dddddd`,
                  borderLeft: i > 2 ? `1px solid #dddddd` : `none`,
                  padding: 10,
                  textTransform: `uppercase`,
                  fontWeight: 600,
                  fontSize: `80%`,
                  textAlign: `center`,
                  verticalAlign: `center`,
                }}>
                  { header }
                </div>
              ))
            }
          </div>
          {
            (this.props.data || []).map((row, i) => (
              <div style={{ display: `table-row` }}>
                {
                  headers.map((header, j) => (
                    <div style={{
                      display: `table-cell`,
                      borderBottom: j === 2 ? `1px solid #dddddd` : `none`,
                      borderLeft: j < 4 ? `1px solid #dddddd` : `none`,
                      borderTop: i > 0 && j < 2 && row.node[header] ? `1px solid #dddddd` : `none`,
                    }}>
                      {
                        renderCell(row.node[header], j)
                      }
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>
      </div>
    )
  }
}

export default EvaluationTable