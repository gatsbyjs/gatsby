/** @jsx jsx */
import { jsx } from "theme-ui"
import { useState } from "react"
import { renderCell } from "./evaluation-cell"
import SectionTitle from "./evaluation-table-section-title"
import SectionHeaderTop from "./evaluation-table-section-header-top"
import SectionHeaderBottom from "./evaluation-table-section-header-bottom"

export default function EvaluationTable(props) {
  const { options, sections, sectionHeaders } = props
  const [isFeatureCellOpen, setIsFeatureCellOpen] = useState({})
  const showTooltip = (section, row) => isFeatureCellOpen[`${section},${row}`]

  const flatten = arrays => [].concat.apply([], arrays)
  const columnHeaders = [`Category`, `Gatsby`].concat(
    options.map(o => o.display)
  )
  const nodeFieldProperties = [`Feature`, `Gatsby`].concat(
    options.map(o => o.nodeField)
  )

  return (
    <div
      sx={{
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
                            borderBottom: !showTooltip(s, i) ? 1 : `none`,
                            borderColor: `ui.border`,
                            minWidth: 40,
                            px: 0,
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
                            setIsFeatureCellOpen({
                              ...isFeatureCellOpen,
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
                          pb: t => `calc(${t.space[5]} - 1px)`,
                          "&&": {
                            px: [null, 3],
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
