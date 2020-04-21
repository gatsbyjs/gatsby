/** @jsx jsx */
import { jsx } from "theme-ui"
import { Component } from "react"
import SectionTitle from "./evaluation-table-section-title"
import SectionHeaderTop from "./evaluation-table-section-header-top"
import { renderCell } from "./evaluation-cell"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

class SimpleEvaluationTable extends Component {
  constructor() {
    super()
    this.state = {}
  }
  render() {
    const showTooltip = row => this.state[`feature-cell-${row}`]
    const { title, headers, data } = this.props
    return (
      <div>
        {title && <SectionTitle text={title} />}
        <table>
          <tbody>
            <SectionHeaderTop columnHeaders={headers.map(h => h.display)} />
            {data.map((node, idx) =>
              [].concat([
                <tr key={`feature-first-row-${idx}`}>
                  {headers.map((header, i) => (
                    <td
                      key={`feature-cell-${idx}-${i}`}
                      sx={{
                        display: `table-cell`,
                        "&:hover": {
                          cursor: `pointer`,
                        },
                        borderBottom: t =>
                          !showTooltip(idx)
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
                      onClick={() => {
                        this.setState({
                          [`feature-cell-${idx}`]: !showTooltip(idx),
                        })
                      }}
                    >
                      {renderCell(node[header.nodeFieldProperty], i)}
                    </td>
                  ))}
                </tr>,
                // table row containing details of each feature
                <tr
                  style={{
                    display: showTooltip(idx) ? `table-row` : `none`,
                  }}
                  key={`feature-second-row-${idx}`}
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
                          __html: node.Description,
                        }}
                      />
                    }
                  </td>
                </tr>,
              ])
            )}
          </tbody>
        </table>
      </div>
    )
  }
}

export default SimpleEvaluationTable
