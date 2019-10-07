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

    const { options, sections, sectionHeaders } = this.props
    const flatten = arrays => [].concat.apply([], arrays)
    const columnHeaders = [`Category`, `Gatsby`].concat(
      options.map(o => o.display)
    )
    const nodeFieldProperties = [`Feature`, `Gatsby`].concat(
      options.map(o => o.nodeField)
    )

    return (
      <div
        style={{
          // this should be a table, but that breaks the
          // anchor links on this page due to a bug in the
          // scrolling library
          display: `table`,
          overflowX: `scroll`,
          width: `100%`,
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
                        options={options}
                        display={row.node.Subcategory}
                        category={row.node.Subcategory}
                        key={`section-header-${s}-bottom-${i}`}
                      />,
                      // table row with the name of the feature and corresponding scores
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
                            {renderCell(row.node[nodeProperty], j)}
                          </td>
                        ))}
                      </tr>,
                      // table row containing details of each feature
                      <tr
                        style={{
                          display: showTooltip(s, i) ? `table-row` : `none`,
                        }}
                        key={`section-${s}-second-row-${i}`}
                      >
                        <td
                          css={{
                            fontSize: fontSizes[1],
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
