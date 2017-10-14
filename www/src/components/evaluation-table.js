import React, { Component } from 'react'
import presets from "../utils/presets"
import EvaluationCell from './evaluation-cell'
import Link from "gatsby-link"
import infoIcon from "../assets/info-icon.svg"
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
                display: `inline-block`,
                marginLeft: `auto`,
                marginRight: `auto`,
              }}
            >
              <a css={{fontWeight: `normal !important` }} onClick={e => {e.preventDefault()}}>
                {text}
                &nbsp;
                <img
                  src={infoIcon}
                  css={{
                    height: rhythm(1 / 2),
                    marginBottom: 0,
                    display: `inline-block`,
                  }}
                />
              </a>
            </div>
          )
        }
        case 1:
        case 2:
        case 3:
        case 4: {
          return (
            <div
              css={{
                margin: `auto`,
                height: rhythm(3 / 4),
                width: rhythm(3 / 4),
                verticalAlign: `middle`,
                [presets.Mobile]: {
                  height: rhythm(5 / 4),
                  width: rhythm(5 / 4),
                },
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
          sections.map((section, s) => [
            <div
              // this should be a table, but that breaks the
              // anchor links on this page due to a bug in the
              // scrolling library
              key={s}
              style={{
                marginTop: rhythm(1),
                maxWidth: 800,
              }}
            >
              <div
                style={{
                  display: `table`,
                  //borderBottom: options.tableBorder,
                  overflowX: "scroll"
                }}
              >
                <SectionTitle text={sectionHeaders[s]}/>
                <SectionHeaderTop />
                <SectionHeaderBottom />
                {
                  section.map((row, i) => ([
                    //
                    <tr
                      key="header"
                      css={{
                        display: !row.node.Subcategory ? `none` : `table-row`,
                        borderBottom: `none`,
                        //borderLeft: options.tableBorder,
                        //borderRight: options.tableBorder,
                      }}
                    >
                      <td
                        css={{
                          borderBottom: `none`,
                          fontFamily: options.headerFontFamily.join(`,`),
                          textAlign: `center`,
                          paddingRight: 0,
                        }}
                      >
                        <b><i>{row.node.Subcategory}</i></b>
                      </td>
                      <td css={{ borderBottom: `none` }}/>
                      <td css={{ borderBottom: `none` }}/>
                      <td css={{ borderBottom: `none` }}/>
                      <td css={{ borderBottom: `none` }}/>
                    </tr>,
                    <div key="fake" dangerouslySetInnerHTML={{ __html: `<span id="${row.node.Feature.toLowerCase().split(` `).join(`-`)}"></span>` }}/>,
                    <tr
                      key={2*i}
                    >
                      {
                        headers.map((header, j) => (
                          <td
                            key={j}
                            css={{
                              display: `table-cell`,
                              borderBottom: `none`,
                              //borderLeft: j < 1 || !showTooltip(s,i) ? options.tableBorder : `none`,
                              "&:hover": {
                                cursor: j >= 0 ? `pointer` : `inherit`,
                              },
                              width: j === 0 ? 120 : `inherit`,
                              paddingRight: 0,
                              paddingLeft: 0,
                              textAlign: `center`,
                              verticalAlign: `middle`,
                            }}
                            onClick={() => {
                              this.setState({
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
                      <td
                        key={0}
                        css={{
                          display: `table-cell`,
                          //borderLeft: options.tableBorder,
                          [presets.Tablet]: {
                            display: `table-cell`,
                          },
                          paddingRight: 0,
                          paddingLeft: 0,
                          borderBottom: `none`,
                        }}
                      />
                      <td
                        key={1}
                        css={{
                          //borderBottom: options.tableBorder,
                          fontFamily: options.headerFontFamily.join(`,`),
                          paddingRight: 0,
                          paddingLeft: 0,
                          borderBottom: `none`,
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
                    </tr>,
                  ]))
                }
              </div>
            </div>
          ])
        }
      </div>
    )
  }
}

export default EvaluationTable