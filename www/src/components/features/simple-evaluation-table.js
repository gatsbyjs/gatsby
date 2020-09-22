/** @jsx jsx */
import { jsx } from "theme-ui"
import { useState } from "react"
import SectionTitle from "./evaluation-table-section-title"
import SectionHeaderTop from "./evaluation-table-section-header-top"
import { renderCell } from "./evaluation-cell"

const tdStyles = {
  display: `table-cell`,
  "&:hover": {
    cursor: `pointer`,
  },
  minWidth: 40,
  px: 0,
  textAlign: `left`,
  verticalAlign: `middle`,
  fontSize: 1,
  lineHeight: `solid`,
}

export default function SimpleEvaluationTable(props) {
  const { title, headers, data } = props
  const [featureCell, setFeatureCell] = useState({})
  const showTooltip = row => featureCell[`feature-cell-${row}`]

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
                      ...tdStyles,
                      borderBottom: !showTooltip(idx) ? 1 : `none`,
                      borderColor: `ui.border`,
                    }}
                    onClick={() => {
                      setFeatureCell({
                        ...featureCell,
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
                sx={{
                  display: showTooltip(idx) ? `table-row` : `none`,
                }}
                key={`feature-second-row-${idx}`}
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
