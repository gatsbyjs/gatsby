/** @jsx jsx */
import { jsx } from "theme-ui"
import { Component } from "react"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
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
                        display={row.Subcategory}
                        category={row.Subcategory}
                        key={`section-header-${s}-bottom-${i}`}
                      />,
                      // table row with the name of the feature and corresponding scores
                      <tr key={`section-${s}-first-row-${i}`}>
                        {nodeFieldProperties.map((nodeProperty, j) => (
                          <td
                            key={j}
                            sx={{
                              display: `table-cell`,
                              "&:hover": {
                                cursor: j >= 0 ? `pointer` : `inherit`,
                              },
                              borderBottom: t =>
                                !showTooltip(s, i)
                                  ? `1px solid ${t.colors.ui.border}`
                                  : `none`,
                              minWidth: 40,
                              paddingRight: 0,
                              paddingLeft: 0,
                              textAlign: `left`,
                              verticalAlign: `middle`,
                              fontSize: 1,
                              lineHeight: `solid`,
                            }}
                            id={
                              j === 0
                                ? row.Feature.toLowerCase().split(` `).join(`-`)
                                : undefined
                            }
                            onClick={() => {
                              this.setState({
                                [`${s},${i}`]: !showTooltip(s, i),
                              })
                            }}
                          >
                            {renderCell(row[nodeProperty], j)}
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
                          sx={{
                            paddingBottom: t => `calc(${t.space[5]} - 1px)`,
                            "&&": {
                              [mediaQueries.xs]: {
                                px: 3,
                              },
                            },
                          }}
                          colSpan="5"
                        >
                          {
                            <span
                              dangerouslySetInnerHTML={{
                                __html: row.Description,
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
