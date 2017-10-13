import React, { Component } from 'react'
import presets from "../utils/presets"
import EvaluationCell from './evaluation-cell'
import Link from "gatsby-link"

import SectionTitle from "./evaluation-table-section-title"
import SectionHeaderTop from "./evaluation-table-section-header-top"
import SectionHeaderBottom from "./evaluation-table-section-header-bottom"
import { options, rhythm } from "../utils/typography"

class EvaluationTable extends Component {
  constructor() {
    super()
    this.state = {}
  }
  render() {
    const headers = [
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
                padding: rhythm(1 / 2),
                verticalAlign: `middle`,
                textAlign: `center`,
                width: 130,
                fontFamily: options.headerFontFamily.join(`,`),
              }}
            >
              { text }
            </div>
          )
        }
        case 1: {
          return (
            <div
              id={text.toLowerCase().split(` `).join(`-`)}
              style={{
                padding: rhythm(1 / 2),
                verticalAlign: `middle`,
                textAlign: `center`,
                width: 130,
              }}
            >
              <a onClick={e => {e.preventDefault()}}>
                  { text }
              </a>
            </div>
          )
        }
        case 2:
        case 3:
        case 4:
        case 5: {
          return (
            <div
              style={{
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

    const showTooltip = (section, row) => (
      this.state[`${section},${row}`]
    )

    const { sections, sectionHeaders } = this.props
    return (
      <div>
        {
          sections.map((section, s) => (
            <table
              key={s}
              style={{
                borderBottom: options.tableBorder,
                marginTop: rhythm(1),
                maxWidth: 800,
              }}
            >
              <tbody>
                <SectionTitle text={sectionHeaders[s]}/>
                <SectionHeaderTop />
                <SectionHeaderBottom />
                {
                  section.map((row, i) => ([
                    <tr
                      key={2*i}
                      css={{
                        borderRight: options.tableBorder,
                      }}
                    >
                      {
                        headers.map((header, j) => (
                          <td
                            key={j}
                            css={{
                              display: j === 0 ? `none` : `table-cell`,
                              borderBottom: (j > 0 || row.node[header]) && !showTooltip(s,i) ? options.tableBorder : `none`,
                              borderLeft: j < 2 || !showTooltip(s,i) ? options.tableBorder : `none`,
                              [presets.Tablet]: {
                                display: `table-cell`,
                              },
                              "&:hover": {
                                cursor: j >= 1 ? `pointer` : `inherit`,
                              },
                              paddingRight: 0,
                              paddingLeft: 0,
                            }}
                            onClick={() => {
                              j >= 1 && this.setState({
                                [`${s},${i}`]: !showTooltip(s,i),
                              })
                            }}
                          >
                            {
                              renderCell(row.node[header], j)
                            }
                          </td>
                        ))
                      }
                    </tr>,
                    <tr
                      key={2*i + 1}
                      style={{
                        display: showTooltip(s,i) ? `table-row` : `none`,
                        borderRight: options.tableBorder,
                      }}
                    >
                      {
                        [0,1,2].map(col => (
                            col < 2 ?
                            <td
                              key={col}
                              css={{
                                display:  col < 1 ? `none` : `table-cell`,
                                borderLeft: options.tableBorder,
                                [presets.Tablet]: {
                                  display: `table-cell`,
                                },
                                paddingRight: 0,
                                paddingLeft: 0,
                              }}
                            /> :
                            <td
                              key={col}
                              css={{
                                borderBottom: options.tableBorder,
                                padding: `10px !important`,
                                fontSize: `70%`,
                                paddingRight: 0,
                                paddingLeft: 0,
                              }}
                              colSpan="4"
                            >
                              {
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: row.node.Description,
                                  }}
                                />
                              }
                            </td>
                        ))
                      }
                    </tr>,
                  ]))
                }
              </tbody>
            </table>
          ))
        }
      </div>
    )
  }
}

export default EvaluationTable