import React, { Component } from "react"
import {
  colors,
  space,
  mediaQueries,
  fontSizes,
  lineHeights,
} from "../../utils/presets"
import { renderCell } from "./evaluation-cell"
import SectionTitle from "./evaluation-table-section-title"
import SectionHeaderTop from "./evaluation-table-section-header-top"
import SectionHeaderBottom from "./evaluation-table-section-header-bottom"

class EvaluationTable extends Component {
  constructor() {
    super()
    this.state = {}
  }
  render() {
    const showTooltip = (section, row) => this.state[`${section},${row}`]

    const {
      columnHeaders,
      nodeFieldProperties,
      sections,
      sectionHeaders,
    } = this.props
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
                <SectionHeaderTop
                  key={`section-header-${s}`}
                  columnHeaders={columnHeaders}
                />,
              ].concat(
                flatten(
                  section.map((row, i) =>
                    [].concat([
                      <SectionHeaderBottom
                        nodeFieldProperties={nodeFieldProperties}
                        display={row.node.Subcategory}
                        category={row.node.Subcategory}
                        key={`section-header-${s}-bottom-${i}`}
                      />,
                      <tr key={`section-${s}-first-row-${i}`}>
                        {nodeFieldProperties.map((nodeProperty, j) => (
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
                            {renderCell(row.node[nodeProperty], j)}
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
