import React, { Component } from "react"
import MdInfoOutline from "react-icons/lib/md/info-outline"
import {
  colors,
  space,
  mediaQueries,
  fontSizes,
  lineHeights,
} from "../utils/presets"
import EvaluationCell from "./evaluation-cell"
import SectionTitle from "./evaluation-table-section-title"
import SectionHeaderTop from "./evaluation-table-section-header-top"
import SectionHeaderBottom from "./evaluation-table-section-header-bottom"

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
        <span key={`info-icon-${words[words.length - 1]}`}>
          {` `}
          {`${words[words.length - 1]} `}
          <MdInfoOutline
            alt={`Info Icon`}
            style={{ color: colors.grey[50], verticalAlign: `baseline` }}
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
                  background: `none`,
                  border: 0,
                  cursor: `inherit`,
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
                        key={`section-header-${s}-bottom-${i}`}
                      />,
                      <tr key={`section-${s}-first-row-${i}`}>
                        {headers.map((header, j) => (
                          <td
                            key={j}
                            css={{
                              display: `table-cell`,
                              "&:hover": {
                                cursor: j >= 0 ? `pointer` : `inherit`,
                              },
                              borderBottom: !showTooltip(s, i)
                                ? `1px solid ${colors.ui.border.subtle}`
                                : `none`,
                              minWidth: 40,
                              paddingRight: 0,
                              paddingLeft: 0,
                              textAlign: `left`,
                              verticalAlign: `middle`,
                              fontSize: fontSizes[1],
                              lineHeight: lineHeights.solid,
                            }}
                            id={
                              j === 0
                                ? row.node.Feature.toLowerCase()
                                    .split(` `)
                                    .join(`-`)
                                : undefined
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
                        key={`section-${s}-second-row-${i}`}
                      >
                        <td
                          css={{
                            paddingBottom: `calc(${space[5]} - 1px)`,
                            "&&": {
                              [mediaQueries.xs]: {
                                paddingRight: `${space[3]}`,
                                paddingLeft: `${space[3]}`,
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
