import React, { Component } from "react"
import presets, { colors, space } from "../utils/presets"
import EvaluationCell from "./evaluation-cell"
import infoIcon from "../assets/info-icon.svg"
import SectionTitle from "./evaluation-table-section-title"
import SectionHeaderTop from "./evaluation-table-section-header-top"
import SectionHeaderBottom from "./evaluation-table-section-header-bottom"
import { rhythm } from "../utils/typography"

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
          css={
            {
              // WebkitHyphens: `auto`,
              // MsHyphens: `auto`,
              // hyphens: `auto`,
              // wordBreak: `break-all`,
              // display: `inline-block`,
            }
          }
          key={`info-icon-${words[words.length - 1]}`}
        >
          {` `}
          {`${words[words.length - 1]} `}
          <img
            src={infoIcon}
            css={{
              height: rhythm(space[3]),
              marginBottom: rhythm(space[1]),
              verticalAlign: `baseline`,
            }}
            alt={`Info Icon`}
          />
        </span>,
      ]
    }
    const headers = [`Feature`, `Gatsby`, `Jekyll`, `WordPress`, `Squarespace`]
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
              }}
            >
              <button
                css={{
                  border: 0,
                  padding: 0,
                  textAlign: `left`,
                }}
                onClick={e => {
                  e.preventDefault()
                }}
              >
                {renderText(text)}
              </button>
              {/* eslint-enable */}
            </div>
          )
        }
        case 1:
        case 2:
        case 3:
        case 4: {
          return <EvaluationCell num={text} />
        }
        default: {
          return null
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
        <tbody>
          {flatten(
            sections.map((section, s) =>
              [
                <SectionTitle
                  text={sectionHeaders[s]}
                  key={`section-title-${s}`}
                />,
                <SectionHeaderTop key={`section-header-${s}`} />,
              ].concat(
                flatten(
                  section.map((row, i) =>
                    [].concat([
                      <SectionHeaderBottom
                        display={row.node.Subcategory}
                        category={row.node.Subcategory}
                        key={`section-header-bottom-${i}`}
                      />,
                      <tr key={`first-row-${i}`}>
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
                              fontSize: presets.scale[1],
                              lineHeight: presets.lineHeights.solid,
                            }}
                            id={
                              j === 0
                                ? row.node.Feature.toLowerCase()
                                    .split(` `)
                                    .join(`-`)
                                : false
                            }
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
                        key={`second-row-${i}`}
                      >
                        <td
                          css={{
                            paddingBottom: `calc(${rhythm(
                              presets.space[5]
                            )} - 1px)`,
                            "&&": {
                              [presets.Xs]: {
                                paddingRight: `${rhythm(space[3])}`,
                                paddingLeft: `${rhythm(space[3])}`,
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
        </tbody>
      </div>
    )
  }
}

export default EvaluationTable
