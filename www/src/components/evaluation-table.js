import React, { Component } from "react"
import presets, { colors } from "../utils/presets"
import EvaluationCell from "./evaluation-cell"
import { Link } from "gatsby"
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
            // WebkitHyphens: `auto`,
            // MsHyphens: `auto`,
            // hyphens: `auto`,
            // wordBreak: `break-all`,
            // display: `inline-block`,
            "&:hover": {
              background: colors.ui.bright,
            },
          }}
        >
          {` `}
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
              css={{
                verticalAlign: `middle`,
                textAlign: `left`,
                display: `inline-block`,
                marginLeft: `auto`,
                marginRight: `auto`,
                padding: `${rhythm(1 / 4)} 0 ${rhythm(1 / 4)} ${rhythm(1 / 4)}`,
                [presets.Mobile]: {
                  padding: `${rhythm(1 / 2)} 0 ${rhythm(1 / 2)} ${rhythm(
                    1 / 2
                  )}`,
                },
              }}
            >
              <a
                css={{
                  "&&": {
                    fontWeight: `normal`,
                    borderBottom: 0,
                  },
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
          return <EvaluationCell num={text} />
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
                      dangerouslySetInnerHTML={{
                        __html: `<span id="${row.node.Feature.toLowerCase()
                          .split(` `)
                          .join(`-`)}"></span>`,
                      }}
                    />,
                    <tr>
                      {headers.map((header, j) => (
                        <td
                          key={j}
                          css={{
                            display: `table-cell`,
                            "&:hover": {
                              cursor: j >= 0 ? `pointer` : `inherit`,
                            },
                            borderBottom: !showTooltip(s, i)
                              ? `1px solid ${colors.ui.light}`
                              : `none`,
                            minWidth: 40,
                            paddingRight: 0,
                            paddingLeft: 0,
                            textAlign: `left`,
                            verticalAlign: `middle`,
                            fontSize: `90%`,
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
                      style={{
                        display: showTooltip(s, i) ? `table-row` : `none`,
                      }}
                    >
                      <td
                        css={{
                          fontFamily: options.headerFontFamily.join(`,`),
                          paddingBottom: `calc(${rhythm(1)} - 1px)`,
                          "&&": {
                            paddingRight: `${rhythm(1 / 4)}`,
                            paddingLeft: `${rhythm(1 / 4)}`,
                            [presets.Mobile]: {
                              paddingRight: `${rhythm(1 / 2)}`,
                              paddingLeft: `${rhythm(1 / 2)}`,
                            },
                            [presets.Phablet]: {
                              paddingRight: `${rhythm(2)}`,
                              paddingLeft: `${rhythm(2)}`,
                            },
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
