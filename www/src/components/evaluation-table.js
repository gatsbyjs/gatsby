import React, { Component } from "react"
import presets from "../utils/presets"
import EvaluationCell from "./evaluation-cell"
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
    const renderText = txt => {
      const words = txt.split(` `)
      return [
        words.slice(0, words.length - 1).join(` `),
        <span
          css={{
            "-webkitHyphens": `auto`,
            "-msHyphens": `auto`,
            hyphens: `auto`,
            wordBreak: `break-all`,
            display: `inline-block`,
            "&:hover": {
              background: `#e0d6eb`,
            },
          }}
        >
          &nbsp;
          {`${words[words.length - 1]} `}
          <img
            src={infoIcon}
            css={{
              height: rhythm(2 / 5),
              marginBottom: rhythm(2 / 15),
              verticalAlign: `text-bottom`,
            }}
          />
        </span>,
      ]
    }
    const headers = [`Feature`, `Gatsby`, `Jekyll`, `Wordpress`, `Squarespace`]
    const renderCell = (text, column) => {
      switch (column) {
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
              <a
                css={{
                  fontWeight: `normal !important`,
                }}
                onClick={e => {
                  e.preventDefault()
                }}
              >
                {renderText(text)}
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
                  height: rhythm(1),
                  width: rhythm(1),
                },
              }}
            >
              <EvaluationCell num={text} />
            </div>
          )
        }
      }
    }

    const showTooltip = (section, row) => this.state[`${section},${row}`]

    const { sections, sectionHeaders } = this.props
    const flatten = arrays => [].concat.apply([], arrays)

    return (
      <div
        style={{
          // this should be a table, but that breaks the
          // anchor links on this page due to a bug in the
          // scrolling library
          display: `table`,
          overflowX: `scroll`,
        }}
      >
        {flatten(
          sections.map((section, s) =>
            [
              <SectionTitle text={sectionHeaders[s]} />,
              <SectionHeaderTop />,
            ].concat(
              flatten(
                section.map((row, i) =>
                  [].concat([
                    <SectionHeaderBottom
                      display={row.node.Subcategory}
                      category={row.node.Subcategory}
                    />,
                    <div
                      key="fake"
                      dangerouslySetInnerHTML={{
                        __html: `<span id="${row.node.Feature
                          .toLowerCase()
                          .split(` `)
                          .join(`-`)}"></span>`,
                      }}
                    />,
                    <tr key={2 * i}>
                      {headers.map((header, j) => (
                        <td
                          key={j}
                          css={{
                            display: `table-cell`,
                            "&:hover": {
                              cursor: j >= 0 ? `pointer` : `inherit`,
                            },
                            borderBottom: !showTooltip(s, i)
                              ? `invalidCSS`
                              : `none`,
                            minWidth: 40,
                            paddingRight: 0,
                            paddingLeft: 0,
                            textAlign: `center`,
                            verticalAlign: `middle`,
                            fontSize: `80%`,
                            lineHeight: `${rhythm(3 / 4)}`,
                          }}
                          onClick={() => {
                            this.setState({
                              [`${s},${i}`]: !showTooltip(s, i),
                            })
                          }}
                        >
                          {renderCell(row.node[header], j)}
                        </td>
                      ))}
                    </tr>,
                    <tr
                      key={2 * i + 1}
                      style={{
                        display: showTooltip(s, i) ? `table-row` : `none`,
                        borderRight: options.tableBorder,
                      }}
                    >
                      <td
                        key={1}
                        css={{
                          fontFamily: options.headerFontFamily.join(`,`),
                          paddingRight: `${rhythm(1)} !important`,
                          paddingLeft: `${rhythm(1)} !important`,
                          paddingBottom: `calc(${rhythm(1)} - 1px)`,
                          [presets.Mobile]: {
                            paddingRight: `${rhythm(2)} !important`,
                            paddingLeft: `${rhythm(2)} !important`,
                          },
                        }}
                        colSpan="5"
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
                  ])
                )
              )
            )
          )
        )}
      </div>
    )
  }
}

export default EvaluationTable
