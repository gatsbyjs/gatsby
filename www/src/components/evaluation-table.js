import React, { Component } from 'react'
import presets from "../utils/presets"
import EvaluationCell from './evaluation-cell'
import Link from "gatsby-link"

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
      `Area`,
      `Category`,
      `Feature`,
      <img
        src={'https://camo.githubusercontent.com/9c70ec950802d744cd3bccaa97fadbfdd7c8f2a9/68747470733a2f2f7777772e6761747362796a732e6f72672f6761747362792d6e656761746976652e737667'}
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

    const renderSuperHeader = () => (
      <div style={{ display: `table-row` }}>
        {
          superHeaderTitles.map((header, i) => (
            <div css={{
              display: i >= 2 ? `table-cell` : `none`,
              borderBottom: i > 2 ? `1px solid #dddddd` : `none`,
              padding: 10,
              textTransform: `uppercase`,
              fontSize: `80%`,
              fontWeight: 600,
              textAlign: `center`,
              verticalAlign: `bottom`,
              [presets.Tablet]: {
                display: i === 0 ? `none` : `table-cell`,
              },
            }}>
              { header }
            </div>
          ))
        }
      </div>
    )

    const renderSubHeader = () => (
      <div style={{ display: `table-row` }}>
        {
          subHeaderTitles.map((header, i) => (
            <div css={{
              display: i >= 2 ? `table-cell` : `none`,
              borderBottom: `1px solid #dddddd`,
              borderLeft: i > 2 ? `1px solid #dddddd` : `none`,
              borderRight: i === 6 ? `1px solid #dddddd` : `none`,
              padding: 10,
              textTransform: `uppercase`,
              fontWeight: 600,
              fontSize: `80%`,
              textAlign: `center`,
              verticalAlign: `center`,
              [presets.Tablet]: {
                display: i === 0 ? `none` : `table-cell`,
              },
            }}>
              { header }
            </div>
          ))
        }
      </div>
    )

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
                textAlign: `center`,
                width: 150,
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
                textAlign: `center`,
                width: 150,
              }}
            >
              {
                <Link to={`/features/#${text.toLowerCase().split(` `).join(`-`)}`}>
                  { text }
                </Link>
              }
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

    const sections = this.props.data
      .map((row, i) => row.node.Category ? i : -1)
      .filter(rowNum => rowNum !== -1)
      .map((rowNum, i, arr) => {
        if (i < arr.length - 1) {
          return [rowNum, arr[i+1]]
        }

        return [rowNum, this.props.data.length]
      })
      .map(bounds => this.props.data.slice(bounds[0], bounds[1]))

    const sectionHeaders = this.props.data
      .filter(row => row.node.Category)
      .map(row => row.node.Category)

    return (
      <div style={{marginLeft: 25, marginRight: 25}}>
        <div style={{ display: `table-row` }}>
          <div style={{ borderBottom: 0, marginBottom: 25 }}>
            { this.props.header }
          </div>
        </div>
        {
          sections.map((section, s) => (
            <div>
              <div style={{ display: `table-row` }}>
                <br/>
                <h3>{sectionHeaders[s]}</h3>
              </div>
              <div style={{
                display: `table`,
                color: `#9d9d9d`,
                marginLeft: `auto`,
                marginRight: `auto`,
                borderBottom: `1px solid #dddddd`,
                maxWidth: 800,
                paddingLeft: 25,
                paddingRight: 25,
              }}>
                { renderSuperHeader() }
                { renderSubHeader() }
                {
                  section.map((row, i) => (
                    <div style={{ display: `table-row` }}>
                      {
                        headers.map((header, j) => (
                          <div css={{
                            display: j < 2 ? `none` : `table-cell`,
                            borderBottom: j === 2 ? `1px solid #dddddd` : `none`,
                            borderLeft: j < 7 ? `1px solid #dddddd` : `none`,
                            borderRight: j === 6 ? `1px solid #dddddd` : `none`,
                            borderTop: (i > 0 && j < 2 && row.node[header]) || (i > 0 && j > 2) ? `1px solid #dddddd` : `none`,
                            [presets.Tablet]: {
                              display: j === 0 ? `none` : `table-cell`,
                            },
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
          ))
        }
        {
          sections.map((section, s) => (
            <div>
              <div style={{ display: `table-row`, textAlign: `left` }}>
                <br/>
                <h3>{sectionHeaders[s]}</h3>
              </div>
              {
                section.map((row, i) => (
                  <div style={{textAlign: `left`}}>
                    <h4 id={row.node[`Feature`].toLowerCase().split(` `).join(`-`)}>
                      {row.node[`Feature`]}
                    </h4>
                    <p>{row.node.Description}</p>
                  </div>
                ))
              }
          </div>
        ))
      }
      </div>
    )
  }
}

export default EvaluationTable